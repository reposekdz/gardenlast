import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import {
    Loader2, ShieldAlert, Plus, Calendar, X, Search, Trash2, Filter,
    ChevronLeft, ChevronRight, User
} from 'lucide-react';

const ACTION_TYPES = [
    { value: 'warning',         label: 'Iburira (Warning)' },
    { value: 'conduct_removal', label: 'Gukuraho amanota y\'imyitwarire' },
    { value: 'conduct_good',    label: 'Imyitwarire myiza' },
    { value: 'punish',          label: 'Igihano' },
    { value: 'suspension',      label: 'Guhagarikwa by\'agateganyo' },
    { value: 'praise',          label: 'Gushimirwa' }
];

const SEVERITY_OPTIONS = [
    { value: 'low',    label: 'Low',    color: 'bg-emerald-100 text-emerald-700' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
    { value: 'high',   label: 'High',   color: 'bg-red-100 text-red-700' }
];

const STATUS_OPTIONS = [
    { value: 'active',   label: 'Active',   color: 'bg-blue-100 text-blue-700' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-700' },
    { value: 'appealed', label: 'Appealed', color: 'bg-orange-100 text-orange-700' }
];

const TeacherConduct = () => {
    const { t } = useTranslation();
    const { token } = useAuthStore();
    const API_URL = import.meta.env.VITE_API_URL || '';
    const headers = { Authorization: `Bearer ${token}` };

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [students, setStudents] = useState([]);
    const [studentQ, setStudentQ] = useState('');
    const [picked, setPicked] = useState(null);

    const [filterAction, setFilterAction] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [form, setForm] = useState({
        action_type: 'warning',
        description: '',
        severity: 'low',
        location: '',
        points_deducted: 0
    });

    const loadRecords = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterAction) params.action_type = filterAction;
            if (filterSeverity) params.severity = filterSeverity;
            if (filterStatus) params.status = filterStatus;
            const r = await axios.get(`${API_URL}/api/teacher/conduct`, { headers, params });
            setRecords(r.data);
        } catch { toast.error('Failed to load conduct records'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadRecords(); }, [filterAction, filterSeverity, filterStatus]);

    useEffect(() => {
        if (!studentQ.trim()) { setStudents([]); return; }
        const t = setTimeout(async () => {
            try {
                const r = await axios.get(`${API_URL}/api/teacher/students`, { headers, params: { q: studentQ.trim(), limit: 8 } });
                setStudents(r.data.students || r.data.slice(0, 8));
            } catch {}
        }, 250);
        return () => clearTimeout(t);
    }, [studentQ]);

    const submit = async (e) => {
        e.preventDefault();
        if (!picked) return toast.error('Hitamo umunyeshuri');
        if (!form.description.trim()) return toast.error('Andika ibisobanuro');
        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/teacher/conduct`, {
                student_id: picked.id,
                action_type: form.action_type,
                description: form.description.trim(),
                severity: form.severity,
                location: form.location || null,
                points_deducted: Number(form.points_deducted) || 0,
                incident_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }, { headers });
            toast.success('Imyitwarire yanditswe neza. SMS yoherejwe ku babyeyi.');
            setShowForm(false);
            setPicked(null); setStudentQ('');
            setForm({ action_type: 'warning', description: '', severity: 'low', location: '', points_deducted: 0 });
            loadRecords();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Emeza gusiba iyi nkuru y\'imyitwarire?')) return;
        setDeletingId(id);
        try {
            await axios.delete(`${API_URL}/api/teacher/conduct/${id}`, { headers });
            toast.success('Inkuru yasibwe');
            loadRecords();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
        finally { setDeletingId(null); }
    };

    const getActionLabel = (v) => ACTION_TYPES.find(a => a.value === v)?.label || v;
    const getSeverityStyle = (v) => SEVERITY_OPTIONS.find(s => s.value === v)?.color || 'bg-gray-100 text-gray-700';
    const getStatusStyle = (v) => STATUS_OPTIONS.find(s => s.value === v)?.color || 'bg-gray-100 text-gray-700';

    const fmtDate = (d) => d ? new Date(d).toLocaleString('en-GB') : '\u2014';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Imyitwarire y&apos;abanyeshuri</h1>
                    <p className="text-gray-500 text-sm">Andika imyitwarire, kandi ushobora gusiba izawe. SMS izoherezwa ababyeyi.</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl flex items-center gap-2 shadow-lg">
                    <Plus size={18} /> Andika imyitwarire
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                    <option value="">Ubwuko bwose</option>
                    {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                    <option value="">Severity yose</option>
                    {SEVERITY_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                    <option value="">Status yose</option>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <ShieldAlert size={20} className="text-red-600" />
                    <h2 className="font-black text-lg text-gray-900">Inkuru natanze ({records.length})</h2>
                </div>
                {loading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>
                ) : records.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        <ShieldAlert size={40} className="mx-auto mb-2 opacity-30" />
                        <p>Nta nkuru z&apos;imyitwarire urashyizeho.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                    <th className="px-4 py-3 text-left">Itariki</th>
                                    <th className="px-4 py-3 text-left">Umunyeshuri</th>
                                    <th className="px-4 py-3 text-left">Trade / Level</th>
                                    <th className="px-4 py-3 text-left">Ubwoko</th>
                                    <th className="px-4 py-3 text-left">Ibisobanuro</th>
                                    <th className="px-4 py-3 text-right">- Points</th>
                                    <th className="px-4 py-3 text-center">Severity</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-xs whitespace-nowrap">{fmtDate(r.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-bold">{r.first_name} {r.last_name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{r.reg_number}</p>
                                        </td>
                                        <td className="px-4 py-3 text-xs">{r.trade} &middot; {r.level}</td>
                                        <td className="px-4 py-3 text-xs">{getActionLabel(r.action_type)}</td>
                                        <td className="px-4 py-3 max-w-xs truncate text-gray-700">{r.description}</td>
                                        <td className="px-4 py-3 text-right font-bold text-red-600">{r.points_deducted || 0}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getSeverityStyle(r.severity)}`}>{r.severity}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusStyle(r.status)}`}>{r.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                disabled={deletingId === r.id}
                                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                                title="Siba"
                                            >
                                                {deletingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[92vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 flex justify-between items-center sticky top-0 z-10">
                            <h3 className="font-black text-white text-lg">Andika imyitwarire</h3>
                            <button onClick={() => setShowForm(false)} className="text-white/80 hover:text-white"><X size={22} /></button>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Umunyeshuri *</label>
                                {picked ? (
                                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                        <div>
                                            <p className="font-bold text-emerald-900">{picked.first_name} {picked.last_name}</p>
                                            <p className="text-xs text-emerald-700 font-mono">{picked.reg_number} &middot; {picked.trade} &middot; {picked.level}</p>
                                        </div>
                                        <button type="button" onClick={() => { setPicked(null); setStudentQ(''); }}
                                            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input value={studentQ} onChange={e => setStudentQ(e.target.value)}
                                            placeholder="Shakisha izina / kode"
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20" />
                                        {students.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
                                                {students.map(s => (
                                                    <button type="button" key={s.id} onClick={() => { setPicked(s); setStudentQ(''); setStudents([]); }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0">
                                                        <p className="font-bold text-sm">{s.first_name} {s.last_name}</p>
                                                        <p className="text-xs text-gray-500 font-mono">{s.reg_number} &middot; {s.trade}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Ubwoko *</label>
                                    <select value={form.action_type} onChange={e => setForm(p => ({ ...p, action_type: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none">
                                        {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Severity</label>
                                    <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none">
                                        {SEVERITY_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Ibisobanuro *</label>
                                <textarea required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Aho byabereye</label>
                                    <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Amanota agukurwaho</label>
                                    <input type="number" min="0" max="100" value={form.points_deducted}
                                        onChange={e => setForm(p => ({ ...p, points_deducted: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none" />
                                </div>
                            </div>
                            <button type="submit" disabled={submitting}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl disabled:opacity-60 flex items-center justify-center gap-2">
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                                Bika
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherConduct;

