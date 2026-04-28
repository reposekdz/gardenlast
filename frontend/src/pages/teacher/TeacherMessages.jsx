import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import {
    Send, Loader2, Search, MessageSquare, Phone, User, CheckCircle,
    ChevronLeft, ChevronRight, Users, Mail
} from 'lucide-react';

const TeacherMessages = () => {
    const { token } = useAuthStore();
    const API_URL = import.meta.env.VITE_API_URL || '';
    const headers = { Authorization: `Bearer ${token}` };

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [parents, setParents] = useState([]);
    const [loadingParents, setLoadingParents] = useState(false);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sentResult, setSentResult] = useState(null);

    const [filterTrade, setFilterTrade] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [trades, setTrades] = useState([]);

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    useEffect(() => {
        axios.get(`${API_URL}/api/course-notes/trades`).then(r => setTrades(r.data || [])).catch(() => {});
    }, [API_URL]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (filterTrade) params.trade = filterTrade;
            if (filterLevel) params.level = filterLevel;
            if (search.trim()) params.search = search.trim();
            const res = await axios.get(`${API_URL}/api/teacher/students`, { headers, params });
            setStudents(res.data.students || []);
            setPagination(res.data.pagination || { total: 0, totalPages: 1 });
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load students');
        } finally { setLoading(false); }
    };

    useEffect(() => { loadStudents(); }, [API_URL, token, filterTrade, filterLevel, search, page]);

    const loadParents = async (studentId) => {
        setLoadingParents(true);
        try {
            const res = await axios.get(`${API_URL}/api/teacher/students/${studentId}/parents`, { headers });
            setParents(res.data || []);
        } catch {
            setParents([]);
        } finally { setLoadingParents(false); }
    };

    const selectStudent = (student) => {
        setSelectedStudent(student);
        setSentResult(null);
        setMessage('');
        loadParents(student.id);
    };

    const sendMessage = async () => {
        if (!selectedStudent) return toast.error('Hitamo umunyeshuri');
        if (!message.trim()) return toast.error('Andika ubutumwa');
        setSending(true);
        try {
            const res = await axios.post(
                `${API_URL}/api/teacher/students/${selectedStudent.id}/message-parents`,
                { message: message.trim() },
                { headers }
            );
            setSentResult(res.data);
            toast.success(res.data.message || 'SMS yoherejwe');
            setMessage('');
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to send');
        } finally { setSending(false); }
    };

    const selectedTradeObj = trades.find(t => t.name_rw === filterTrade || t.code === filterTrade);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <MessageSquare size={24} className="text-blue-600" />
                        Kohereza Ubutumwa ku Babyeyi
                    </h1>
                    <p className="text-gray-500 text-sm">Hitamo umunyeshuri, urebe ababyeyi bahuze, kohereze SMS.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Shakisha..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={filterTrade} onChange={e => { setFilterTrade(e.target.value); setFilterLevel(''); setPage(1); }}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                                <option value="">Imyuga yose</option>
                                {trades.map(t => <option key={t.code} value={t.name_rw}>{t.name_rw}</option>)}
                            </select>
                            <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setPage(1); }}
                                disabled={!selectedTradeObj}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none disabled:bg-gray-100">
                                <option value="">Inzego zose</option>
                                {selectedTradeObj?.levels?.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase">Abanyeshuri</span>
                            <span className="text-xs text-gray-400">{pagination.total} total</span>
                        </div>
                        {loading ? (
                            <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
                        ) : students.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">Nta munyeshuri uboneka</div>
                        ) : (
                            <div className="max-h-[500px] overflow-y-auto">
                                {students.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => selectStudent(s)}
                                        className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors ${selectedStudent?.id === s.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                                    >
                                        <p className="font-bold text-sm text-gray-900">{s.first_name} {s.last_name}</p>
                                        <p className="text-xs text-gray-500">{s.reg_number} &middot; {s.trade} &middot; {s.level}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                        {pagination.totalPages > 1 && (
                            <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
                                <span className="text-xs text-gray-500">Page {page} / {pagination.totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {selectedStudent ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <User size={18} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                                    <p className="text-xs text-gray-500">{selectedStudent.reg_number} &middot; {selectedStudent.trade} &middot; {selectedStudent.level}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                    <Users size={12} /> Ababyeyi bahuze ({parents.length})
                                </h3>
                                {loadingParents ? (
                                    <div className="py-4 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={20} /></div>
                                ) : parents.length === 0 ? (
                                    <p className="text-sm text-gray-400 bg-gray-50 p-3 rounded-xl">Nta babyeyi bahuze n&apos;uyu munyeshuri</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {parents.map(p => (
                                            <div key={p.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                    <Phone size={14} className="text-emerald-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold truncate">{p.first_name} {p.last_name}</p>
                                                    <p className="text-xs text-gray-500">{p.phone}</p>
                                                </div>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">{p.relationship || 'parent'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                                    <Mail size={12} /> Ubutumwa
                                </label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={4}
                                    maxLength={320}
                                    placeholder="Andika ubutumwa bwohereza ababyeyi..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-sm"
                                />
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-gray-400">Max 320 characters</span>
                                    <span className="text-[10px] text-gray-400">{message.length}/320</span>
                                </div>
                            </div>

                            {sentResult && (
                                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-600" />
                                    <p className="text-sm text-emerald-800 font-medium">{sentResult.message}</p>
                                </div>
                            )}

                            <button
                                onClick={sendMessage}
                                disabled={sending || !message.trim() || parents.length === 0}
                                className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                            >
                                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                {sending ? 'Birimo koherezwa...' : 'Ohereza SMS'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <MessageSquare size={48} className="mx-auto mb-4 text-gray-200" />
                            <p className="text-gray-500 font-medium">Hitamo umunyeshuri mu ruhande rw&apos;ibumoso</p>
                            <p className="text-sm text-gray-400 mt-1">Uzasobanukirwa n&apos;ababyeyi bahuze nawe ukohereze ubutumwa</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherMessages;

