/**
 * Comprehensive SMS Notification Service
 * Uses the africastalking npm package for sends, axios for balance queries.
 */

require('dotenv').config();
const { getDb } = require('../db');

const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY || '';
const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME || 'sandbox';
const AFRICASTALKING_SHORTCODE = process.env.AFRICASTALKING_SHORTCODE || 'GardenTVET';

function formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('250')) return '+' + cleaned;
    if (cleaned.length === 10 && cleaned.startsWith('07')) return '+250' + cleaned.slice(1);
    if (cleaned.length === 9 && cleaned.startsWith('7')) return '+2507' + cleaned.slice(1);
    if (cleaned.startsWith('0')) return '+250' + cleaned.slice(1);
    if (cleaned.startsWith('250')) return '+' + cleaned;
    return '+250' + cleaned;
}

async function sendSMS(phone, message) {
    try {
        const formattedPhone = formatPhoneNumber(phone);
        if (!formattedPhone) return { success: false, error: 'Invalid phone number' };

        const db = getDb();

        // Always use real Africa's Talking API — no mock fallback
        const AfricasTalking = require('africastalking');
        const at = AfricasTalking({ username: AFRICASTALKING_USERNAME, apiKey: AFRICASTALKING_API_KEY });
        const sms = at.SMS;

        const result = await sms.send({
            to: [formattedPhone],
            message,
            from: AFRICASTALKING_SHORTCODE || undefined
        });

        const recipient = result?.SMSMessageData?.Recipients?.[0];
        const messageId = recipient?.messageId;
        const status = recipient?.statusCode === 101 ? 'sent' : 'failed';

        try {
            await db.query(
                'INSERT INTO sms_logs (phone, message, status, created_at) VALUES (?, ?, ?, NOW())',
                [formattedPhone, message, status]
            );
        } catch (_) {}

        return { success: status === 'sent', messageId };
    } catch (err) {
        console.error('SMS Error:', err.message);
        try {
            const db = getDb();
            await db.query(
                'INSERT INTO sms_logs (phone, message, status, created_at) VALUES (?, ?, ?, NOW())',
                [phone, message, 'failed']
            );
        } catch (_) {}
        return { success: false, error: err.message };
    }
}

async function getTemplateMessage(templateKey, data, language = 'rw') {
    try {
        const db = getDb();
        const [templates] = await db.execute(
            'SELECT * FROM sms_templates WHERE template_key = ? AND is_active = TRUE',
            [templateKey]
        );
        if (templates.length === 0) return null;
        const template = templates[0];
        let message = template[`message_${language}`] || template.message_rw;
        for (const [key, value] of Object.entries(data || {})) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            message = message.replace(regex, value || '');
        }
        return message;
    } catch (error) {
        console.error('Error getting template:', error.message);
        return null;
    }
}

async function sendToParent(parentId, templateKey, data, language = 'rw', fallbackMessage = null) {
    try {
        const db = getDb();
        const [parents] = await db.execute('SELECT phone, first_name FROM users WHERE id = ?', [parentId]);
        if (parents.length === 0 || !parents[0].phone) return { success: false, error: 'Parent not found' };
        const parent = parents[0];
        let message = await getTemplateMessage(templateKey, data, language);
        if (!message && fallbackMessage) message = fallbackMessage;
        if (!message) return { success: false, error: 'No message template found' };
        const result = await sendSMS(parent.phone, message);
        try {
            await db.query(
                'INSERT INTO parent_notifications (parent_id, message, notification_type, created_at) VALUES (?, ?, ?, NOW())',
                [parentId, message, 'sms']
            );
        } catch (_) {}
        return result;
    } catch (error) {
        console.error('Error sending to parent:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendToStudentParents(studentId, templateKey, data, language = 'rw', fallbackMessage = null) {
    try {
        const db = getDb();
        const [students] = await db.execute(
            'SELECT first_name, last_name, reg_number, trade, level FROM students WHERE id = ?',
            [studentId]
        );
        if (students.length === 0) return { sent: 0, failed: 0, error: 'Student not found' };
        const student = students[0];
        const enrichedData = {
            ...data,
            student_name: `${student.first_name} ${student.last_name}`,
            student_first: student.first_name,
            student_last: student.last_name,
            reg_number: student.reg_number,
            trade: student.trade,
            level: student.level
        };
        const [links] = await db.execute(
            `SELECT psl.parent_id, u.phone, u.first_name as parent_first, u.last_name as parent_last
             FROM parent_student_links psl
             JOIN users u ON psl.parent_id = u.id
             WHERE psl.student_id = ? AND (psl.status = 'approved' OR psl.link_status = 'approved') AND u.phone IS NOT NULL`,
            [studentId]
        );
        let sent = 0, failed = 0;
        for (const link of links) {
            const parentData = { ...enrichedData, parent_name: `${link.parent_first} ${link.parent_last}`, parent_first: link.parent_first };
            const result = await sendToParent(link.parent_id, templateKey, parentData, language, fallbackMessage);
            if (result.success) sent++; else failed++;
        }
        return { sent, failed };
    } catch (error) {
        console.error('Error sending to student parents:', error.message);
        return { sent: 0, failed: 0, error: error.message };
    }
}

async function sendToMultipleParents(parentIds, message) {
    try {
        const db = getDb();
        let sent = 0, failed = 0;
        for (const parentId of parentIds) {
            const [parents] = await db.execute('SELECT phone FROM users WHERE id = ?', [parentId]);
            if (parents.length > 0 && parents[0].phone) {
                const result = await sendSMS(parents[0].phone, message);
                if (result.success) sent++; else failed++;
            } else { failed++; }
        }
        return { sent, failed };
    } catch (error) {
        return { sent: 0, failed: 0, error: error.message };
    }
}

async function notifyStudentCreated(studentId, data = {}) {
    const db = getDb();
    const [students] = await db.execute(
        'SELECT first_name, last_name, reg_number, trade, level, guardian_phone FROM students WHERE id = ?',
        [studentId]
    );
    if (students.length === 0) return { sent: 0, failed: 0 };
    const student = students[0];
    const [links] = await db.execute(
        `SELECT psl.parent_id, u.phone, u.first_name as parent_first, u.last_name as parent_last
         FROM parent_student_links psl
         JOIN users u ON psl.parent_id = u.id
         WHERE psl.student_id = ? AND (psl.status = 'approved' OR psl.link_status = 'approved') AND u.phone IS NOT NULL`,
        [studentId]
    );
    if (links.length === 0 && student.guardian_phone) {
        const message = `Murakaza neza! Umwana ${student.first_name} ${student.last_name} yanditswe muri Garden TVET School. Nimero yandikisho: ${student.reg_number}. ${student.trade} - ${student.level}.`;
        const result = await sendSMS(student.guardian_phone, message);
        return { sent: result.success ? 1 : 0, failed: result.success ? 0 : 1 };
    }
    let sent = 0, failed = 0;
    for (const link of links) {
        const message = `Murakaza neza ${link.parent_first}! Umwana wawe ${student.first_name} ${student.last_name} yanditswe muri Garden TVET School. Reg: ${student.reg_number}. Trade: ${student.trade}, Level: ${student.level}.`;
        const result = await sendSMS(link.phone, message);
        if (result.success) sent++; else failed++;
    }
    return { sent, failed };
}

async function notifyStudentUpdated(studentId, changes = {}) {
    return sendToStudentParents(
        studentId, 'student_updated', { changes: JSON.stringify(changes) }, 'rw',
        `Amakuru meza! Amakuru ya ${changes.student_name || 'umwana wawe'} yahinduwe muri Garden TVET.`
    );
}

async function notifyStudentDeleted(studentId, reason = '') {
    return sendToStudentParents(
        studentId, 'student_removed', { reason }, 'rw',
        `Murikana, umwana wawe yasibwe muri Garden TVET School. ${reason ? `Impamvu: ${reason}` : ''}`
    );
}

async function notifyStudentStatusChange(studentId, newStatus, reason = '', returnDate = null) {
    const db = getDb();
    const [students] = await db.execute('SELECT first_name, last_name FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) return { sent: 0, failed: 0 };
    const student = students[0];
    const statusConfig = {
        'sick': { template: 'sick_report', fallback: (s, r) => `Murikana, umwana wawe ${s.first_name} ${s.last_name} yarabajwe ko arwaye muri school. Impamvu: ${r || 'Ntabwo ibonetse'}. Itumanikire: +250 780 000 000.` },
        'on_leave': { template: 'leave_approved', fallback: (s, r, d) => `Murikana, umwana wawe ${s.first_name} ${s.last_name} yarasabwe uruhushya rwo kuva ishuri${d ? ` kugeza ${d}` : ''}. Impamvu: ${r || 'Ntabwo ibonetse'}.` },
        'suspended': { template: 'discipline_suspension', fallback: (s, r, d) => `Murikana, umwana wawe ${s.first_name} ${s.last_name} yarahagaritswe kubera ${r || 'ikibazo cyimyitwarire'}.${d ? ` Azagaruka ${d}` : ''}.` },
        'expelled': { template: 'discipline_suspension', fallback: (s, r) => `Murikana, umwana wawe ${s.first_name} ${s.last_name} yakuweho conduct muri Garden TVET School. Impamvu: ${r || 'Imyitwarire mibi'}.` },
        'active': { template: 'sick_recovery', fallback: (s) => `Murikana, umwana wawe ${s.first_name} ${s.last_name} yaragarutse mu ishuri. Murakoze!` },
        'reinstatement': { template: 'discipline_resolved', fallback: (s, r) => `Murikana, umwana wawe ${s.first_name} ${s.last_name} agaruriwe mu nzego nziza. ${r ? `Impamvu: ${r}` : ''}` }
    };
    const config = statusConfig[newStatus];
    if (!config) return { sent: 0, failed: 0 };
    return sendToStudentParents(studentId, config.template, { reason, return_date: returnDate }, 'rw', config.fallback(student, reason, returnDate));
}

async function notifyGradeAdded(studentId, gradeData) {
    const db = getDb();
    const [students] = await db.execute('SELECT first_name, last_name FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) return { sent: 0, failed: 0 };
    const student = students[0];
    const message = `Murikana, umwana wawe ${student.first_name} ${student.last_name} yatangiwe ikigereranyo cya ${gradeData.subject} (${gradeData.grade_type}): ${gradeData.score}/${gradeData.max_score} (${gradeData.grade_letter}). Murakoze!`;
    return sendToStudentParents(studentId, 'grade_added', { subject: gradeData.subject, score: gradeData.score, max_score: gradeData.max_score, grade: gradeData.grade_letter, grade_type: gradeData.grade_type }, 'rw', message);
}

async function notifyGradeChange(studentId, subject, type, gradeData) {
    const db = getDb();
    const [students] = await db.execute('SELECT first_name, last_name FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) return { sent: 0, failed: 0 };
    const student = students[0];
    let message = '', templateType = '';
    if (type === 'deleted') {
        message = `Murikana, ikigereranyo cya ${subject} cy'umwana wawe ${student.first_name} ${student.last_name} cyasibwe. (Score: ${gradeData.score}/${gradeData.max_score})`;
        templateType = 'grade_deleted';
    } else if (type === 'updated') {
        message = `Murikana, ikigereranyo cya ${subject} cy'umwana wawe ${student.first_name} ${student.last_name} cyahinduwe. Shingiro: ${gradeData.score}/${gradeData.max_score} (${gradeData.grade})`;
        templateType = 'grade_updated';
    } else {
        message = `Murikana, umwana wawe ${student.first_name} ${student.last_name} yatangiwe ikigereranyo cya ${subject}: ${gradeData.score}/${gradeData.max_score} (${gradeData.grade}). Murakoze!`;
        templateType = 'grade_added';
    }
    return sendToStudentParents(studentId, templateType, { subject, score: gradeData.score, max_score: gradeData.max_score, grade: gradeData.grade, grade_type: gradeData.grade_type || 'exam' }, 'rw', message);
}

async function notifyStaffCreated(userId) {
    const db = getDb();
    const [staff] = await db.execute('SELECT first_name, last_name, phone, username FROM users WHERE id = ?', [userId]);
    if (staff.length === 0 || !staff[0].phone) return { success: false, error: 'Staff not found or no phone' };
    const user = staff[0];
    const message = `Murakaza neza ${user.first_name}! Konti yawe ya Garden TVET yashyizweho. Username: ${user.username}. Injira kuri gardentvet.rw`;
    return sendSMS(user.phone, message);
}

async function notifyStaffDeleted(userId, adminName = 'Admin') {
    const db = getDb();
    const [staff] = await db.execute('SELECT first_name, last_name, phone FROM users WHERE id = ?', [userId]);
    if (staff.length === 0 || !staff[0].phone) return { success: false };
    const user = staff[0];
    const message = `Murikana ${user.first_name}, konti yawe ya Garden TVET School yasibwe na ${adminName}. Mungire ibitekerezo iyanika: +250 780 000 000.`;
    return sendSMS(user.phone, message);
}

async function notifyLinkApproved(parentId, studentId) {
    const db = getDb();
    const [student] = await db.execute('SELECT first_name, last_name, reg_number, trade, level FROM students WHERE id = ?', [studentId]);
    if (student.length === 0) return { success: false };
    const s = student[0];
    const message = `Amakuru meza! Guhuza n'umwana wawe ${s.first_name} ${s.last_name} (${s.reg_number}) kwemejwe na Garden TVET School. Ubu urashobora kureba amakuru ye kuri app. Murakoze!`;
    return sendToParent(parentId, 'link_approved', { student_name: `${s.first_name} ${s.last_name}`, reg_number: s.reg_number }, 'rw', message);
}

async function notifyLinkRejected(parentId, reason = '') {
    const message = `Murikana, ubusabe bwo guhuza n'umwana wawe bwanzwe na Garden TVET School. ${reason ? `Impamvu: ${reason}` : 'Wasubiza ubusabe bushya.'} Utumanikire: +250 780 000 000.`;
    return sendToParent(parentId, 'link_rejected', { reason }, 'rw', message);
}

async function broadcastToParents(message, trade = null, level = null) {
    const db = getDb();
    let query = `
        SELECT DISTINCT u.id as parent_id, u.phone, u.first_name as parent_first, u.last_name as parent_last
        FROM parent_student_links psl
        JOIN users u ON psl.parent_id = u.id
        JOIN students s ON psl.student_id = s.id
        WHERE (psl.status = 'approved' OR psl.link_status = 'approved') AND u.phone IS NOT NULL
    `;
    const params = [];
    if (trade) { query += ' AND s.trade = ?'; params.push(trade); }
    if (level) { query += ' AND s.level = ?'; params.push(level); }
    const [parents] = await db.execute(query, params);
    let sent = 0, failed = 0;
    for (const parent of parents) {
        const personalizedMessage = `${parent.parent_first}, ${message}`;
        const result = await sendSMS(parent.phone, personalizedMessage);
        if (result.success) sent++; else failed++;
    }
    return { sent, failed, total: parents.length };
}

async function getSMSBalance() {
    try {
        const db = getDb();
        let messagesToday = 0;
        try {
            const [logs] = await db.query('SELECT COUNT(*) as count FROM sms_logs WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)');
            messagesToday = logs[0]?.count || 0;
        } catch (_) {}

        if (!AFRICASTALKING_API_KEY || AFRICASTALKING_API_KEY === 'YOUR_API_KEY' || !AFRICASTALKING_API_KEY) {
            return { success: false, balance: '0', balance_display: 'Not configured', amount: 0, currency: 'RWF', mode: 'unconfigured', username: AFRICASTALKING_USERNAME, messages_today: messagesToday, error: 'AFRICASTALKING_API_KEY is not configured.' };
        }

        const axios = require('axios');
        const response = await axios.get('https://api.africastalking.com/version1/user', {
            headers: { 'apiKey': AFRICASTALKING_API_KEY, 'Accept': 'application/json' },
            params: { username: AFRICASTALKING_USERNAME },
            timeout: 10000
        });

        const userData = response.data?.UserData || {};
        const raw = String(userData.balance || '');
        const match = raw.match(/^([A-Z]{3})\s+([\d,.]+)/i);
        const currency = match ? match[1].toUpperCase() : 'RWF';
        const amount = match ? parseFloat(match[2].replace(/,/g, '')) : parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;

        return { success: true, balance: raw || '0', balance_display: raw || `${currency} 0`, amount, currency, mode: 'live', username: AFRICASTALKING_USERNAME, phoneNumber: userData.phoneNumber, isActive: userData.isActive, messages_today: messagesToday };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message, mode: 'error', balance: '0', balance_display: 'Unavailable', amount: 0, currency: 'RWF' };
    }
}

async function notifyAttendance(studentId, date, status, notes = '') {
    if (status === 'present' || status === 'excused') return { sent: 0, failed: 0 };
    const db = getDb();
    const [students] = await db.execute('SELECT first_name, last_name FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) return { sent: 0, failed: 0 };
    const student = students[0];
    const dateStr = new Date(date).toLocaleDateString('en-GB');
    const statusMap = { 'absent': { rw: 'ntabwo yabonetse' }, 'late': { rw: 'yakererewe' } };
    const statusText = statusMap[status] || { rw: status };
    const message = `Murikana, umwana wawe ${student.first_name} ${student.last_name} ${statusText.rw} mu ishuri uyu munsi tariki ${dateStr}.${notes ? ` Impamvu: ${notes}` : ''}. Murakoze!`;
    return sendToStudentParents(studentId, 'attendance_report', { date: dateStr, status, notes }, 'rw', message);
}

async function notifyDisciplineIncident(studentId, type, description) {
    const db = getDb();
    const [students] = await db.execute('SELECT first_name, last_name FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) return { sent: 0, failed: 0 };
    const student = students[0];
    const studentName = `${student.first_name} ${student.last_name}`;
    const message = `Muraho, tura kumenyesha ko ${studentName} yagize ikibazo cy'imyitwarire (${type}): ${description}. - Garden TVET`;
    return sendToStudentParents(studentId, 'discipline_incident', { type, description, student_name: studentName }, 'rw', message);
}

module.exports = {
    sendSMS, formatPhoneNumber, getTemplateMessage, sendToParent,
    sendToStudentParents, sendToMultipleParents,
    notifyStudentCreated, notifyStudentUpdated, notifyStudentDeleted, notifyStudentStatusChange,
    notifyGradeAdded, notifyGradeChange, notifyStaffCreated, notifyStaffDeleted,
    notifyLinkApproved, notifyLinkRejected, notifyAttendance, notifyDisciplineIncident,
    broadcastToParents, getSMSBalance
};
