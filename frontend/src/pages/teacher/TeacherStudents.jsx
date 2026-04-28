import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import {
    Loader2, Search, Users, Eye, Lock, ChevronLeft, ChevronRight,
    Phone, Mail, MapPin, GraduationCap, ShieldAlert, MessageSquare,
    X, Send, UserCheck, UserX, AlertTriangle, Ban, Clock, BookOpen,
    RefreshCw, Filter
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';
const headers = (token) => ({ Authorization: `Bearer ${token}` });

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'suspended', label: 'Suspended', color: 'bg-amber-100 text-amber-700' },
    { value: 'left', label: 'Left', color: 'bg-gray-100 text-gray-700' },
    { value: 'expelled', label: 'Expelled', color: 'bg-red-100 text-red-700' },
    { value: 'sick', label: 'Sick', color: 'bg-orange-100 text-orange-700' },
    { value: 'on_leave', label: 'On Leave', color: 'bg-blue-100 text-blue-700' }
];

const TeacherStudents = () => {
    const { token } = useAuthStore();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, left: 0, expelled: 0 });
    const [trades, setTrades] = useState([]);
    const [levels, setLevels] = useState([]);

    const [filter, setFilter] = useState({
        trade: '', level: '', status: '', gender: '', search: '', page: 1, limit: 20
    });
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

    // Detail modal
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [studentParents, setStudentParents] = useState([]);
    const [conductHistory, setConductHistory] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Message modal
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/teacher/stats`, { headers: headers(token) });
            setStats(res.data);
        } catch (e) { /* ignore */ }
    }, [token]);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter.trade) params.trade = filter.trade;
            if (filter.level) params.level = filter.level;
            if (filter.status) params.status = filter.status;
            if (filter.gender) params.gender = filter.gender;
            if (filter.search) params.search = filter.search;
            params.page = filter.page;
            params.limit = filter.limit;

            const res = await axios.get(`${API_URL}/api/teacher/students`, {
                headers: headers(token),
                params
            });
            setStudents(res.data.students || []);
            setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    }, [token, filter]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        const t = setTimeout(fetchStudents, 250);
        return () => clearTimeout(t);
    }, [fetchStudents]);

    useEffect(() => {
        axios.get(`${API_URL}/api/trades`, { headers: headers(token) })
            .then(r => {
                const td = r.data || [];
                setTrades(td);
                const allLevels = new Set();
                td.forEach(t => { if (t.levels) t.levels.forEach(l => allLevels.add(l)); });
                setLevels([...allLevels].sort());
            })
            .catch(() => {});
    }, [token]);

    const openStudentDetail = async (student) => {
        setSelectedStudent(student);
        setShowDetailModal(true);
        setLoadingDetail(true);
        try {
            const [parentsRes, conductRes] = await Promise.all([
                axios.get(`${API_URL}/api/teacher/students/${student.id}/parents`, { headers: headers(token) }),
                axios.get(`${API_URL}/api/teacher/students/${student.id}/conduct-history`, { headers: headers(token) })
            ]);
            setStudentParents(parentsRes.data || []);
            setConductHistory(conductRes.data || []);
        } catch (e) {
            toast.error('Failed to load student details');
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim()) return toast.error('Andika ubutumwa');
        if (!selectedStudent) return;
        setSendingMessage(true);
        try {
            const res = await axios.post(
                `${API_URL}/api/teacher/students/${selectedStudent.id}/message-parents`,
                { message: messageText.trim() },
                { headers: headers(token) }
            );
            toast.success(res.data.message || 'Message sent!');
            setShowMessageModal(false);
            setMessageText('');
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const getStatusBadge = (status) => {
        const opt = STATUS_OPTIONS.find(o => o.value === status);
        return opt ? <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${opt.color}`}>{opt.label}</span>
            : <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        Abanyeshuri
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1">
                            <Lock size={12} /> Read only
                        </span>
                    </h1>
                    <p className="text-gray-500 text-sm">Reba urutonde rw'abanyeshuri. Ntibyemewe kongeraho cyangwa guhindura.</p>
                </div>
                <button onClick={() => { fetchStats(); fetchStudents(); }} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'blue', icon: Users },
                    { label: 'Active', value: stats.active, color: 'emerald', icon: UserCheck },
                    { label: 'Suspended', value: stats.suspended, color: 'amber', icon: AlertTriangle },
                    { label: 'Left', value: stats.left, color: 'gray', icon: UserX },
                    { label: 'Expelled', value: stats.expelled, color: 'red', icon: Ban },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center`}>
                                <s.icon size={18} className={`text-${s.color}-600`} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-800">{s.value}</p>
                                <p className="text-xs text-gray-500 font-bold">{s.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="relative sm:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            value={filter.search}
                            onChange={e => setFilter(f => ({ ...f, search: e.target.value, page: 1 }))}
                            placeholder="Shakisha izina, kode, telefoni..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
                        />
                    </div>
                    <select value={filter.trade} onChange={e => setFilter(f => ({ ...f, trade: e.target.value, level: '', page: 1 }))}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none text-sm">
                        <option value="">Imyuga yose</option>
                        {trades.map(t => <option key={t.name || t.id} value={t.name}>{t.name}</option>)}
                    </select>
                    <select value={filter.level} onChange={e => setFilter(f => ({ ...f, level: e.target.value, page: 1 }))}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none text-sm">
                        <option value="">Inzego zose</option>
                        {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value, page: 1 }))}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none text-sm">
                        <option value="">Status yose</option>
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select value={filter.gender} onChange={e => setFilter(f => ({ ...f, gender: e.target.value, page: 1 }))}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none text-sm">
                        <option value="">Igitsina cyose</option>
                        <option value="Male">Gabo</option>
                        <option value="Female">Gore</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-black text-lg text-gray-900 flex items-center gap-2">
                        <Users size={18} className="text-primary-600" />
                        Urutonde rw'abanyeshuri
                    </h2>
                    <span className="text-xs text-gray-500 font-bold">
                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </span>
                </div>
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
                ) : students.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        <Users size={40} className="mx-auto mb-2 opacity-30" />
                        <p>Nta munyeshuri uboneka.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                    <th className="px-4 py-3 text-left">Reg #</th>
                                    <th className="px-4 py-3 text-left">Izina</th>
                                    <th className="px-4 py-3 text-left">Trade</th>
                                    <th className="px-4 py-3 text-left">Level</th>
                                    <th className="px-4 py-3 text-left">Igitsina</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Conduct</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.reg_number}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-bold text-gray-900">{s.first_name} {s.last_name}</p>
                                            {s.contact_phone && <p className="text-xs text-gray-500">{s.contact_phone}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-xs">{s.trade}</td>
                                        <td className="px-4 py-3 text-xs">{s.level}</td>
                                        <td className="px-4 py-3 text-xs">{s.gender}</td>
                                        <td className="px-4 py-3 text-center">{getStatusBadge(s.current_status)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`font-bold text-sm ${(s.conduct_points ?? 40) >= 30 ? 'text-emerald-600' : (s.conduct_points ?? 40) >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                                                {s.conduct_points ?? 40}/40
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openStudentDetail(s)}
                                                className="p-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 inline-flex items-center gap-1 text-xs font-bold"
                                            >
                                                <Eye size={14} /> Reba
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <button
                            onClick={() => setFilter(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
                            disabled={filter.page === 1}
                            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm font-bold flex items-center gap-1"
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <span className="text-sm text-gray-500 font-medium">
                            Page {filter.page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setFilter(f => ({ ...f, page: Math.min(pagination.totalPages, f.page + 1) }))}
                            disabled={filter.page === pagination.totalPages}
                            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm font-bold flex items-center gap-1"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                                    <GraduationCap size={24} className="text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{selectedStudent.first_name} {selectedStudent.last_name}</h3>
                                    <p className="text-sm text-gray-500 font-mono">{selectedStudent.reg_number}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setShowMessageModal(true); }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                                >
                                    <MessageSquare size={14} /> Ohereza ubutumwa
                                </button>
                                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {loadingDetail ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
                        ) : (
                            <div className="p-6 space-y-6">
                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2"><GraduationCap size={16} /> Amakuru y'ishuri</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-500">Trade:</span><span className="font-medium">{selectedStudent.trade}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Level:</span><span className="font-medium">{selectedStudent.level}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Igitsina:</span><span className="font-medium capitalize">{selectedStudent.gender}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Itariki y'amavuko:</span><span className="font-medium">{formatDate(selectedStudent.date_of_birth)}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Status:</span><span>{getStatusBadge(selectedStudent.current_status)}</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2"><Phone size={16} /> Amafaranga</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" />{selectedStudent.contact_phone || '—'}</div>
                                            <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" />{selectedStudent.contact_email || '—'}</div>
                                            <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" />
                                                {[selectedStudent.address_district, selectedStudent.address_sector].filter(Boolean).join(', ') || '—'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2"><BookOpen size={16} /> Umurinzi</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-500">Izina:</span><span className="font-medium">{selectedStudent.guardian_name || '—'}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Telefoni:</span><span className="font-medium">{selectedStudent.guardian_phone || '—'}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Isano:</span><span className="font-medium">{selectedStudent.guardian_relation || '—'}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Conduct:</span>
                                                <span className={`font-bold ${(selectedStudent.conduct_points ?? 40) >= 30 ? 'text-emerald-600' : (selectedStudent.conduct_points ?? 40) >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {selectedStudent.conduct_points ?? 40}/40
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Parents */}
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2"><Users size={16} /> Ababyeyi bahuje</h4>
                                    {studentParents.length === 0 ? (
                                        <p className="text-sm text-gray-400 bg-gray-50 p-3 rounded-xl">Nta babyeyi bahuje na uyu munyeshuri</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {studentParents.map(p => (
                                                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <UserCheck size={14} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">{p.first_name} {p.last_name}</p>
                                                            <p className="text-xs text-gray-500">{p.phone} · {p.relationship}</p>
                                                        </div>
                                                    </div>
                                                    {p.sms_enabled ? (
                                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">SMS yemewe</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">SMS yahagaritswe</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Conduct History */}
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2"><ShieldAlert size={16} /> Amateka y'imyitwarire</h4>
                                    {conductHistory.length === 0 ? (
                                        <p className="text-sm text-gray-400 bg-gray-50 p-3 rounded-xl">Nta mateka y'imyitwarire</p>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {conductHistory.map(c => (
                                                <div key={c.id} className="flex items-start justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                                    <div>
                                                        <p className="font-bold text-sm text-red-800">{c.action_type?.replace(/_/g, ' ')}</p>
                                                        <p className="text-xs text-gray-600">{c.description}</p>
                                                        <p className="text-xs text-gray-400 mt-1">Byanditswe na {c.recorder_first} {c.recorder_last} · {formatDate(c.created_at)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-red-600">-{c.points_deducted || 0} pts</p>
                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            c.severity === 'high' ? 'bg-red-200 text-red-800' :
                                                            c.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                                                            'bg-emerald-200 text-emerald-800'
                                                        }`}>{c.severity}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <MessageSquare size={18} className="text-blue-600" /> Ohereza ubutumwa ku babyeyi
                            </h3>
                            <button onClick={() => { setShowMessageModal(false); setMessageText(''); }} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 rounded-xl p-3 text-sm">
                                <p className="font-bold text-blue-800">Umwana: {selectedStudent.first_name} {selectedStudent.last_name}</p>
                                <p className="text-blue-600 text-xs">Ubutumwa buzajya ku babyeyi bahuze ({studentParents.filter(p => p.sms_enabled !== false).length})</p>
                            </div>
                            <textarea
                                value={messageText}
                                onChange={e => setMessageText(e.target.value)}
                                rows={4}
                                placeholder="Andika ubutumwa bwawe hano..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-sm"
                                maxLength={320}
                            />
                            <p className="text-xs text-gray-400 text-right">{messageText.length}/320</p>
                            <button
                                onClick={handleSendMessage}
                                disabled={sendingMessage || !messageText.trim()}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {sendingMessage ? 'Kohereza...' : 'Ohereza SMS'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudents;

