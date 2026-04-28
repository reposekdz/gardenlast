// Teacher self-service endpoints:
//   • Read-only students list (no add/modify)
//   • Remove conduct records (teacher can remove conduct for their students)
//   • Send messages to parents of linked children
//   • Engagement summary across the teacher's own notes
//   • Comments feed on the teacher's notes
//   • Conduct entries the teacher records (writes to discipline_records)
const express = require('express');
const router = express.Router();
const db = require('../db');
const smsService = require('../utils/smsService');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

const teacherOnly = verifyRole(['teacher']);
const teacherOrAdmin = verifyRole(['teacher', 'admin']);

// ─── TEACHER STATS ───────────────────────────────────────────────────────────
router.get('/stats', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const [[totalResult]] = await db.execute('SELECT COUNT(*) as total FROM students');
        const total = totalResult.total;

        const [statusStats] = await db.execute(`
            SELECT current_status, COUNT(*) as count FROM students GROUP BY current_status
        `);
        const active = statusStats.find(s => s.current_status === 'active')?.count || 0;
        const suspended = statusStats.find(s => s.current_status === 'suspended')?.count || 0;
        const left = statusStats.find(s => s.current_status === 'left')?.count || 0;
        const expelled = statusStats.find(s => s.current_status === 'expelled')?.count || 0;
        const sick = statusStats.find(s => s.current_status === 'sick')?.count || 0;
        const onLeave = statusStats.find(s => s.current_status === 'on_leave')?.count || 0;

        // Teacher's own conduct count
        const [[conductResult]] = await db.execute(
            'SELECT COUNT(*) as count FROM discipline_records WHERE recorded_by = ?',
            [req.user.id]
        );

        // Pending questions
        let pendingQuestions = 0;
        try {
            const [[r]] = await db.query(`SELECT COUNT(*) AS c FROM student_questions WHERE status = 'pending'`);
            pendingQuestions = Number(r?.c || 0);
        } catch {}

        res.json({
            total,
            active,
            suspended,
            left,
            expelled,
            sick,
            on_leave: onLeave,
            my_conduct_records: conductResult.count,
            pending_questions: pendingQuestions
        });
    } catch (e) {
        console.error('teacher stats:', e);
        res.status(500).json({ message: 'Failed to load stats' });
    }
});

// ─── READ-ONLY STUDENTS (admin-like filtering) ───────────────────────────────
router.get('/students', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const { trade, level, status, gender, search, page = 1, limit = 50 } = req.query;
        const safeLimit = Math.max(1, Math.min(500, parseInt(limit, 10) || 50));
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const offset = (safePage - 1) * safeLimit;

        const where = [];
        const params = [];

        if (trade) { where.push('trade = ?'); params.push(trade); }
        if (level) { where.push('level = ?'); params.push(level); }
        if (status) { where.push('current_status = ?'); params.push(status); }
        if (gender) { where.push('gender = ?'); params.push(gender); }
        if (search) {
            where.push('(first_name LIKE ? OR last_name LIKE ? OR reg_number LIKE ? OR contact_phone LIKE ? OR guardian_name LIKE ?)');
            const sp = `%${search}%`;
            params.push(sp, sp, sp, sp, sp);
        }

        const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

        const [rows] = await db.execute(
            `SELECT id, reg_number, first_name, last_name, trade, level,
                    gender, contact_phone, contact_email, current_status, conduct_points,
                    gpa, attendance_rate, date_of_birth, year_enrolled,
                    guardian_name, guardian_phone, guardian_relation,
                    address_province, address_district, address_sector, address_cell, address_village,
                    student_type
             FROM students ${whereClause}
             ORDER BY trade, level, last_name, first_name
             LIMIT ${safeLimit} OFFSET ${offset}`,
            params
        );

        // Count total
        const [countResult] = await db.execute(
            `SELECT COUNT(*) as total FROM students ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        res.json({
            students: rows,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                totalPages: Math.ceil(total / safeLimit)
            }
        });
    } catch (e) {
        console.error('teacher students:', e);
        res.status(500).json({ message: 'Failed to load students' });
    }
});

// ─── SINGLE STUDENT VIEW ─────────────────────────────────────────────────────
router.get('/students/:id', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const [[student]] = await db.execute(
            `SELECT id, reg_number, first_name, last_name, trade, level,
                    gender, contact_phone, contact_email, current_status, conduct_points,
                    gpa, attendance_rate, date_of_birth, year_enrolled,
                    guardian_name, guardian_phone, guardian_relation,
                    address_province, address_district, address_sector, address_cell, address_village,
                    student_type, created_at
             FROM students WHERE id = ?`,
            [req.params.id]
        );
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Get linked parents
        const [parents] = await db.execute(
            `SELECT u.id, u.first_name, u.last_name, u.phone, u.email,
                    psl.relationship, psl.is_primary, psl.status as link_status
             FROM parent_student_links psl
             JOIN users u ON psl.parent_id = u.id
             WHERE psl.student_id = ? AND (psl.status = 'approved' OR psl.link_status = 'approved')`,
            [req.params.id]
        );

        res.json({ ...student, parents });
    } catch (e) {
        console.error('teacher student detail:', e);
        res.status(500).json({ message: 'Failed to load student' });
    }
});

// ─── STUDENT CONDUCT HISTORY ─────────────────────────────────────────────────
router.get('/students/:id/conduct-history', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const [records] = await db.execute(
            `SELECT d.id, d.action_type, d.description, d.severity, d.incident_date,
                    d.location, d.points_deducted, d.status, d.created_at,
                    u.first_name as recorder_first, u.last_name as recorder_last
             FROM discipline_records d
             LEFT JOIN users u ON d.recorded_by = u.id
             WHERE d.student_id = ?
             ORDER BY d.created_at DESC`,
            [req.params.id]
        );
        res.json(records);
    } catch (e) {
        console.error('teacher conduct history:', e);
        res.status(500).json({ message: 'Failed to load conduct history' });
    }
});

// ─── STUDENT PARENTS ─────────────────────────────────────────────────────────
router.get('/students/:id/parents', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const [parents] = await db.execute(
            `SELECT u.id, u.first_name, u.last_name, u.phone, u.email,
                    psl.relationship, psl.is_primary, psl.sms_enabled
             FROM parent_student_links psl
             JOIN users u ON psl.parent_id = u.id
             WHERE psl.student_id = ? AND (psl.status = 'approved' OR psl.link_status = 'approved') AND u.phone IS NOT NULL`,
            [req.params.id]
        );
        res.json(parents);
    } catch (e) {
        console.error('student parents:', e);
        res.status(500).json({ message: 'Failed to load parents' });
    }
});

// ─── SEND MESSAGE TO PARENTS OF LINKED STUDENT ───────────────────────────────
router.post('/students/:id/message-parents', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Ubutumwa burakenewe' });
        }

        const studentId = req.params.id;

        // Get student info for template
        const [[student]] = await db.execute(
            'SELECT first_name, last_name, reg_number, trade, level FROM students WHERE id = ?',
            [studentId]
        );
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Send via real Africa's Talking API using the existing service
        const result = await smsService.sendToStudentParents(
            studentId,
            'general_announcement',
            {
                parent_name: '',
                message: message.trim(),
                student_name: `${student.first_name} ${student.last_name}`,
                reg_number: student.reg_number,
                trade: student.trade,
                level: student.level
            },
            'rw',
            `[Garden TVET] ${message.trim()}`
        );

        res.json({
            success: true,
            message: `SMS sent to ${result.sent} parent(s)`,
            sent: result.sent,
            failed: result.failed
        });
    } catch (e) {
        console.error('teacher message parents:', e);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// ─── CONDUCT ─────────────────────────────────────────────────────────────────
router.post('/conduct', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const {
            student_id, action_type, description, severity,
            location, points_deducted, incident_date, witness_names
        } = req.body;
        if (!student_id || !action_type || !description) {
            return res.status(400).json({ message: 'Uzuza umunyeshuri, ubwoko n\'ibisobanuro' });
        }

        const evidenceJson = JSON.stringify([]);

        const [result] = await db.execute(
            `INSERT INTO discipline_records
             (student_id, action_type, description, severity, incident_date, location,
              witness_names, evidence_files, recorded_by, follow_up_required, points_deducted)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                student_id, action_type, String(description).slice(0, 4000),
                severity || 'low', incident_date || new Date(), location || null,
                witness_names || null, evidenceJson, req.user.id, false,
                Number(points_deducted) || 0
            ]
        );

        // Deduct conduct points if applicable
        if (Number(points_deducted) > 0) {
            const [[stu]] = await db.query('SELECT conduct_points FROM students WHERE id = ?', [student_id]);
            const before = Number(stu?.conduct_points ?? 40);
            const after = Math.max(0, before - Number(points_deducted));
            await db.execute('UPDATE students SET conduct_points = ? WHERE id = ?', [after, student_id]);
        }

        // REAL SMS notification to parents using Africa's Talking
        try {
            await smsService.notifyDisciplineIncident(
                student_id,
                action_type,
                String(description).slice(0, 160)
            );
        } catch (smsErr) {
            console.error('Conduct SMS notification error:', smsErr.message);
            // Non-fatal: record still created even if SMS fails
        }

        res.status(201).json({ message: 'Imyitwarire yanditswe neza', id: result.insertId });
    } catch (e) {
        console.error('teacher conduct add:', e);
        res.status(500).json({ message: 'Failed to record conduct' });
    }
});

// List conduct records recorded by this teacher
router.get('/conduct', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const onlyMine = req.user.role === 'teacher';
        const { action_type, severity, status } = req.query;
        const params = [];
        const filters = [];

        if (onlyMine) { filters.push('d.recorded_by = ?'); params.push(req.user.id); }
        if (action_type) { filters.push('d.action_type = ?'); params.push(action_type); }
        if (severity) { filters.push('d.severity = ?'); params.push(severity); }
        if (status) { filters.push('d.status = ?'); params.push(status); }

        const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

        const sql = `
            SELECT d.id, d.action_type, d.description, d.severity, d.incident_date,
                   d.location, d.points_deducted, d.status, d.created_at,
                   s.id AS student_id, s.reg_number, s.first_name, s.last_name,
                   s.trade, s.level, s.conduct_points
            FROM discipline_records d
            LEFT JOIN students s ON d.student_id = s.id
            ${whereClause}
            ORDER BY d.created_at DESC
            LIMIT 500
        `;
        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (e) {
        console.error('teacher conduct list:', e);
        res.status(500).json({ message: 'Failed to load conduct records' });
    }
});

// Teacher can remove/delete their own conduct records
router.delete('/conduct/:id', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const conductId = req.params.id;

        // Verify the record belongs to this teacher (or admin can delete any)
        const [[record]] = await db.execute(
            'SELECT * FROM discipline_records WHERE id = ?',
            [conductId]
        );
        if (!record) return res.status(404).json({ message: 'Record not found' });

        if (req.user.role === 'teacher' && record.recorded_by !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own records' });
        }

        // Restore conduct points if points were deducted
        if (Number(record.points_deducted) > 0) {
            const [[stu]] = await db.query('SELECT conduct_points FROM students WHERE id = ?', [record.student_id]);
            const before = Number(stu?.conduct_points ?? 40);
            const after = Math.min(40, before + Number(record.points_deducted));
            await db.execute('UPDATE students SET conduct_points = ? WHERE id = ?', [after, record.student_id]);
        }

        await db.execute('DELETE FROM discipline_records WHERE id = ?', [conductId]);
        res.json({ message: 'Conduct record removed' });
    } catch (e) {
        console.error('teacher conduct delete:', e);
        res.status(500).json({ message: 'Failed to remove conduct record' });
    }
});

// ─── ENGAGEMENT SUMMARY ──────────────────────────────────────────────────────
router.get('/engagement', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const onlyMine = req.user.role === 'teacher';
        const noteFilter = onlyMine ? 'AND n.uploaded_by = ?' : '';
        const noteParams = onlyMine ? [req.user.id] : [];

        const [perNote] = await db.execute(`
            SELECT n.id, n.title, n.trade_code, n.trade_name, n.level,
                   n.cover_image, n.view_count, n.download_count, n.created_at,
                   (SELECT COUNT(*) FROM note_comments c WHERE c.note_id = n.id) AS comment_count,
                   (SELECT COUNT(*) FROM note_reactions r WHERE r.note_id = n.id) AS reaction_count,
                   (SELECT COUNT(*) FROM note_reactions r WHERE r.note_id = n.id AND r.reaction = 'like') AS like_count,
                   (SELECT COUNT(*) FROM note_reactions r WHERE r.note_id = n.id AND r.reaction = 'helpful') AS helpful_count,
                   (SELECT COUNT(*) FROM note_reactions r WHERE r.note_id = n.id AND r.reaction = 'love') AS love_count,
                   (SELECT COUNT(*) FROM note_reactions r WHERE r.note_id = n.id AND r.reaction = 'question') AS hand_count,
                   (SELECT COUNT(*) FROM note_bookmarks b WHERE b.note_id = n.id) AS bookmark_count
            FROM course_notes n
            WHERE 1=1 ${noteFilter}
            ORDER BY n.created_at DESC
            LIMIT 200
        `, noteParams);

        const totals = perNote.reduce((acc, n) => {
            acc.notes        += 1;
            acc.views        += Number(n.view_count) || 0;
            acc.downloads    += Number(n.download_count) || 0;
            acc.comments     += Number(n.comment_count) || 0;
            acc.likes        += Number(n.like_count) || 0;
            acc.helpful      += Number(n.helpful_count) || 0;
            acc.love         += Number(n.love_count) || 0;
            acc.raised_hands += Number(n.hand_count) || 0;
            acc.bookmarks    += Number(n.bookmark_count) || 0;
            return acc;
        }, { notes: 0, views: 0, downloads: 0, comments: 0, likes: 0, helpful: 0, love: 0, raised_hands: 0, bookmarks: 0 });

        let pendingQuestions = 0;
        try {
            const [[r]] = await db.query(
                `SELECT COUNT(*) AS c FROM student_questions WHERE status = 'pending'`
            );
            pendingQuestions = Number(r?.c || 0);
        } catch {}

        res.json({ totals: { ...totals, pending_questions: pendingQuestions }, notes: perNote });
    } catch (e) {
        console.error('teacher engagement:', e);
        res.status(500).json({ message: 'Failed to load engagement' });
    }
});

// ─── COMMENTS FEED on teacher's notes ────────────────────────────────────────
router.get('/notes/comments', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const onlyMine = req.user.role === 'teacher';
        const where = ['1=1'];
        const params = [];
        if (onlyMine) { where.push('n.uploaded_by = ?'); params.push(req.user.id); }

        const [rows] = await db.execute(`
            SELECT c.id, c.body, c.likes, c.created_at, c.commenter_role, c.commenter_name,
                   c.parent_comment_id,
                   n.id AS note_id, n.title AS note_title, n.trade_code, n.level
            FROM note_comments c
            INNER JOIN course_notes n ON n.id = c.note_id
            WHERE ${where.join(' AND ')}
            ORDER BY c.created_at DESC
            LIMIT 200
        `, params);
        res.json(rows);
    } catch (e) {
        console.error('teacher comments feed:', e);
        res.status(500).json({ message: 'Failed to load comments' });
    }
});

// ─── BOOKMARKS feed (who saved my notes) ─────────────────────────────────────
router.get('/notes/bookmarks', verifyToken, teacherOrAdmin, async (req, res) => {
    try {
        const onlyMine = req.user.role === 'teacher';
        const where = ['1=1'];
        const params = [];
        if (onlyMine) { where.push('n.uploaded_by = ?'); params.push(req.user.id); }
        const [rows] = await db.execute(`
            SELECT b.id, b.owner_name, b.created_at,
                   n.id AS note_id, n.title AS note_title, n.trade_code, n.level
            FROM note_bookmarks b
            INNER JOIN course_notes n ON n.id = b.note_id
            WHERE ${where.join(' AND ')}
            ORDER BY b.created_at DESC
            LIMIT 200
        `, params);
        res.json(rows);
    } catch (e) {
        console.error('teacher bookmarks feed:', e);
        res.status(500).json({ message: 'Failed to load bookmarks' });
    }
});

module.exports = router;

