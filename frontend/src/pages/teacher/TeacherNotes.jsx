import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import { extractPdfCover } from '../../utils/pdfCover';
import {
    Upload, FileText, Trash2, Loader2, BookOpen, Plus, Calendar,
    Eye, Download, Sparkles, Video, Play, ExternalLink, Radio
} from 'lucide-react';

const TeacherNotes = () => {
    const { t } = useTranslation();
    const { user, token } = useAuthStore();
    const API_URL = import.meta.env.VITE_API_URL || '';
    const headers = { Authorization: `Bearer ${token}` };

    const [activeTab, setActiveTab] = useState('notes');
    const [trades, setTrades] = useState([]);
    const [notes, setNotes] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [form, setForm] = useState({ trade_code: '', level: '', title: '', description: '' });
    const [videoForm, setVideoForm] = useState({ trade_code: '', level: '', title: '', description: '', video_url: '' });
    const [file, setFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverAuto, setCoverAuto] = useState(false);
    const [extractingCover, setExtractingCover] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLive, setIsLive] = useState(false);
    const [liveStreamUrl, setLiveStreamUrl] = useState('');

    const selectedTrade = trades.find(t => t.code === form.trade_code);
    const selectedVideoTrade = trades.find(t => t.code === videoForm.trade_code);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [tRes, nRes] = await Promise.all([
                axios.get(`${API_URL}/api/course-notes/trades`),
                axios.get(`${API_URL}/api/course-notes`)
            ]);
            setTrades(tRes.data);
            setNotes(nRes.data);
            // Filter videos from notes (those with video_url set or is_video flag)
            setVideos(nRes.data.filter(n => n.video_url || n.is_video));
        } catch { toast.error('Failed to load notes'); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchAll(); }, []);

    const resetForm = () => {
        setForm({ trade_code: '', level: '', title: '', description: '' });
        setFile(null); setCoverFile(null);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverPreview(null); setCoverAuto(false);
    };

    const resetVideoForm = () => {
        setVideoForm({ trade_code: '', level: '', title: '', description: '', video_url: '' });
        setVideoFile(null);
        setUploadProgress(0);
    };

    const handlePickPdf = async (e) => {
        const f = e.target.files?.[0] || null;
        setFile(f); if (!f) return;
        if (!coverFile || coverAuto) {
            try {
                setExtractingCover(true);
                const blob = await extractPdfCover(f, { maxWidth: 800, quality: 0.8 });
                const autoFile = new File([blob], `cover-${Date.now()}.jpg`, { type: 'image/jpeg' });
                if (coverPreview) URL.revokeObjectURL(coverPreview);
                setCoverFile(autoFile); setCoverPreview(URL.createObjectURL(blob)); setCoverAuto(true);
            } catch (err) { console.warn(err); }
            finally { setExtractingCover(false); }
        }
    };

    const handlePickCover = (e) => {
        const f = e.target.files?.[0] || null; if (!f) return;
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); setCoverAuto(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Hitamo PDF file');
        if (!form.trade_code || !form.level || !form.title.trim()) return toast.error('Uzuza amakuru yose');
        setSubmitting(true);
        const fd = new FormData();
        fd.append('trade_code', form.trade_code);
        fd.append('level', form.level);
        fd.append('title', form.title.trim());
        fd.append('description', form.description || '');
        fd.append('file', file);
        if (coverFile) fd.append('cover', coverFile);
        try {
            await axios.post(`${API_URL}/api/course-notes`, fd, {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Note yashyizweho!');
            resetForm(); setShowForm(false); fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
        finally { setSubmitting(false); }
    };

    const handleVideoUpload = async (e) => {
        e.preventDefault();
        if (!videoForm.trade_code || !videoForm.level || !videoForm.title.trim()) {
            return toast.error('Uzuza amakuru yose asabwa');
        }
        if (!videoFile && !videoForm.video_url.trim()) {
            return toast.error('Shyiramo video cyangwa wongere URL ya YouTube/video');
        }
        setSubmitting(true);
        setUploadProgress(0);
        try {
            const fd = new FormData();
            fd.append('trade_code', videoForm.trade_code);
            fd.append('level', videoForm.level);
            fd.append('title', videoForm.title.trim());
            fd.append('description', videoForm.description || '');
            fd.append('is_video', '1');
            if (videoForm.video_url.trim()) fd.append('video_url', videoForm.video_url.trim());
            if (videoFile) {
                fd.append('file', videoFile);
                // Generate a placeholder cover for video
                fd.append('description', (videoForm.description || '') + ' [VIDEO]');
            }
            await axios.post(`${API_URL}/api/course-notes`, fd, {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
                }
            });
            toast.success('Video yashyizweho!');
            resetVideoForm(); setShowVideoForm(false); fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Video upload failed'); }
        finally { setSubmitting(false); setUploadProgress(0); }
    };

    const handleStartLive = async () => {
        if (!liveStreamUrl.trim()) return toast.error('Injiza URL ya live stream');
        setIsLive(true);
        toast.success('Live stream yatangiye! Wanafunzi barashobora kubona.');
        // In production, this would notify students via WebSocket/SSE
    };

    const handleStopLive = () => {
        setIsLive(false);
        setLiveStreamUrl('');
        toast.info('Live stream yahagaritswe');
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Siba "${title}"?`)) return;
        try {
            await axios.delete(`${API_URL}/api/course-notes/${id}`, { headers });
            toast.success('Note yasibwe'); fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    const myNotes = notes.filter(n => (user.role === 'admin' || n.uploaded_by_name === user.username) && !n.is_video && !n.video_url);
    const myVideos = notes.filter(n => (user.role === 'admin' || n.uploaded_by_name === user.username) && (n.is_video || n.video_url));

    const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));
    const getYouTubeId = (url) => {
        const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
        return m ? m[1] : null;
    };

    return (
        <div className="space-y-6">
            {/* Tab Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Inyandiko n'Amashusho</h1>
                    <p className="text-gray-500 text-sm">PDF, video n'inyigisho za live ziri muri rumwe.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                        <button onClick={() => setActiveTab('notes')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === 'notes' ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
                            <FileText size={15} /> PDF Notes
                        </button>
                        <button onClick={() => setActiveTab('videos')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === 'videos' ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
                            <Video size={15} /> Videos
                        </button>
                        <button onClick={() => setActiveTab('live')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === 'live' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <Radio size={15} /> {isLive ? <span className="text-red-600 animate-pulse">LIVE</span> : 'Live'}
                        </button>
                    </div>
                    {activeTab === 'notes' && (
                        <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-black rounded-xl flex items-center gap-2 shadow-lg text-sm">
                            <Plus size={16} /> Shyiramo PDF
                        </button>
                    )}
                    {activeTab === 'videos' && (
                        <button onClick={() => setShowVideoForm(true)} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl flex items-center gap-2 shadow-lg text-sm">
                            <Plus size={16} /> Ongeza Video
                        </button>
                    )}
                </div>
            </div>

            {/* ── PDF NOTES TAB ── */}
            {activeTab === 'notes' && (
                <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-black text-lg text-gray-900 flex items-center gap-2">
                            <FileText size={20} className="text-primary-600" />
                            {user.role === 'admin' ? 'Inyandiko zose (PDF)' : 'PDF Zanjye'}
                        </h2>
                        <span className="text-xs font-bold text-gray-500">{myNotes.length} total</span>
                    </div>
                    {loading ? (
                        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
                    ) : myNotes.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            <BookOpen size={40} className="mx-auto mb-2 opacity-30" />
                            <p className="font-bold">Nta nyandiko ziraboneka</p>
                            <p className="text-sm">Kanda «Shyiramo PDF» utangire.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                        <th className="px-4 py-3 text-left">Cover</th>
                                        <th className="px-4 py-3 text-left">Title</th>
                                        <th className="px-4 py-3 text-left">Trade</th>
                                        <th className="px-4 py-3 text-left">Level</th>
                                        <th className="px-4 py-3 text-left">Stats</th>
                                        <th className="px-4 py-3 text-left">Uploaded</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {myNotes.map(n => (
                                        <tr key={n.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                {n.cover_image ? (
                                                    <img src={`${API_URL}/api/course-notes/${n.id}/cover`} alt=""
                                                        className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <FileText size={20} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-gray-900">{n.title}</p>
                                                {n.description && <p className="text-xs text-gray-500 truncate max-w-xs">{n.description}</p>}
                                            </td>
                                            <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase">{n.trade_code}</span></td>
                                            <td className="px-4 py-3 font-semibold whitespace-nowrap">{n.level}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 mr-2"><Eye size={12} /> {n.view_count || 0}</span>
                                                <span className="inline-flex items-center gap-1"><Download size={12} /> {n.download_count || 0}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                <div className="flex items-center gap-1"><Calendar size={12} />{new Date(n.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a href={`${API_URL}/api/course-notes/${n.id}/view`} target="_blank" rel="noreferrer"
                                                        className="p-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100" title="View">
                                                        <BookOpen size={15} />
                                                    </a>
                                                    <button onClick={() => handleDelete(n.id, n.title)}
                                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {/* ── VIDEOS TAB ── */}
            {activeTab === 'videos' && (
                <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-black text-lg text-gray-900 flex items-center gap-2">
                            <Video size={20} className="text-red-500" />
                            {user.role === 'admin' ? 'Video zose' : 'Video Zanjye'}
                        </h2>
                        <span className="text-xs font-bold text-gray-500">{myVideos.length} total</span>
                    </div>
                    {loading ? (
                        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-red-500" size={32} /></div>
                    ) : myVideos.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            <Video size={40} className="mx-auto mb-2 opacity-30" />
                            <p className="font-bold">Nta video ziraboneka</p>
                            <p className="text-sm">Kanda «Ongeza Video» utangire.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {myVideos.map(n => {
                                const ytId = n.video_url ? getYouTubeId(n.video_url) : null;
                                return (
                                    <div key={n.id} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video bg-gray-900 overflow-hidden">
                                            {ytId ? (
                                                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={n.title}
                                                    className="w-full h-full object-cover" />
                                            ) : n.cover_image ? (
                                                <img src={`${API_URL}/api/course-notes/${n.id}/cover`} alt={n.title}
                                                    className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Video size={48} className="text-gray-600" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                                    <Play size={20} className="text-gray-900 ml-0.5" />
                                                </div>
                                            </div>
                                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full uppercase">{n.trade_code} · {n.level}</span>
                                        </div>
                                        {/* Info */}
                                        <div className="p-3">
                                            <p className="font-bold text-gray-900 text-sm line-clamp-2">{n.title}</p>
                                            {n.description && <p className="text-xs text-gray-500 mt-1 truncate">{n.description}</p>}
                                            <div className="flex items-center gap-2 mt-3">
                                                {n.video_url ? (
                                                    <a href={n.video_url} target="_blank" rel="noreferrer"
                                                        className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                                        <ExternalLink size={12} /> Reba Video
                                                    </a>
                                                ) : (
                                                    <a href={`${API_URL}/api/course-notes/${n.id}/view`} target="_blank" rel="noreferrer"
                                                        className="flex-1 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                                        <Play size={12} /> Reba
                                                    </a>
                                                )}
                                                <button onClick={() => handleDelete(n.id, n.title)}
                                                    className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {/* ── LIVE STREAMING TAB ── */}
            {activeTab === 'live' && (
                <div className="space-y-6">
                    {/* Live Controls */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                            <h2 className="font-black text-lg text-gray-900">
                                {isLive ? <span className="text-red-600">LIVE — Inyigisho Irakomeza</span> : 'Tangira Inyigisho ya Live'}
                            </h2>
                        </div>

                        {!isLive ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                        URL ya Live Stream * <span className="text-xs font-normal text-gray-500">(YouTube Live, Zoom, Google Meet, n.k.)</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={liveStreamUrl}
                                        onChange={e => setLiveStreamUrl(e.target.value)}
                                        placeholder="https://youtube.com/live/... au https://meet.google.com/..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                                    <p className="font-bold mb-1">📡 Ibikenewe:</p>
                                    <ul className="space-y-1 text-xs list-disc pl-4">
                                        <li>Fungura YouTube Live, Zoom, Google Meet, n.k. mbere</li>
                                        <li>Kopi URL ya inyigisho yawe hano</li>
                                        <li>Kanda "Tangira Live" — wanafunzi bazabona arfa</li>
                                        <li>Hagarika live igihe inyigisho irangiye</li>
                                    </ul>
                                </div>
                                <button
                                    onClick={handleStartLive}
                                    disabled={!liveStreamUrl.trim()}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <Radio size={18} /> Tangira Live
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Radio size={22} className="text-red-600 animate-pulse" />
                                        <span className="text-xl font-black text-red-600">ON AIR</span>
                                    </div>
                                    <p className="text-sm text-red-700 mb-4">Inyigisho yawe irakorera. Wanafunzi barashobora kubona.</p>
                                    <a href={liveStreamUrl} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50">
                                        <ExternalLink size={14} /> Fungura Live Stream
                                    </a>
                                </div>
                                {/* Embed preview if YouTube */}
                                {liveStreamUrl && (liveStreamUrl.includes('youtube.com') || liveStreamUrl.includes('youtu.be')) && (() => {
                                    const ytId = getYouTubeId(liveStreamUrl);
                                    return ytId ? (
                                        <div className="aspect-video rounded-2xl overflow-hidden border border-gray-200">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                                className="w-full h-full"
                                                allowFullScreen
                                                allow="autoplay; encrypted-media"
                                                title="Live Stream Preview"
                                            />
                                        </div>
                                    ) : null;
                                })()}
                                <button
                                    onClick={handleStopLive}
                                    className="w-full py-3 bg-gray-700 hover:bg-gray-800 text-white font-black rounded-xl flex items-center justify-center gap-2"
                                >
                                    Hagarika Live
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Past Recordings */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-black text-gray-900 flex items-center gap-2">
                                <Video size={18} className="text-gray-500" /> Inyigisho za Vuba (Recordings)
                            </h3>
                        </div>
                        {myVideos.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Nta nyigisho za vuba ziraboneka</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {myVideos.slice(0, 5).map(n => (
                                    <div key={n.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50">
                                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Video size={18} className="text-red-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-gray-900 truncate">{n.title}</p>
                                            <p className="text-xs text-gray-500">{n.trade_code} · {n.level} · {new Date(n.created_at).toLocaleDateString()}</p>
                                        </div>
                                        {n.video_url && (
                                            <a href={n.video_url} target="_blank" rel="noreferrer"
                                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── PDF Upload Modal ── */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-primary-700 to-primary-800 px-6 py-5 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="font-black text-white text-lg">Shyiramo inyandiko (PDF)</h3>
                                <p className="text-primary-200 text-sm">Hitamo umwuga, urwego, n'inyandiko</p>
                            </div>
                            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Umwuga *</label>
                                    <select required value={form.trade_code}
                                        onChange={e => setForm(p => ({ ...p, trade_code: e.target.value, level: '' }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none">
                                        <option value="">-- Hitamo --</option>
                                        {trades.map(t => <option key={t.code} value={t.code}>{t.name_rw}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Urwego (Level) *</label>
                                    <select required value={form.level}
                                        onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                                        disabled={!selectedTrade}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none disabled:bg-gray-100">
                                        <option value="">-- Hitamo --</option>
                                        {selectedTrade?.levels.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Izina ry'isomo *</label>
                                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none" maxLength={200} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Ubusobanuro (optional)</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none" rows={2} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">PDF File * (max 25 MB)</label>
                                <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50">
                                    <Upload size={20} className="text-primary-600" />
                                    <span className="text-sm font-semibold text-gray-700">{file ? file.name : 'Hitamo PDF file'}</span>
                                    <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handlePickPdf} />
                                </label>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-gray-700">Cover image</label>
                                    {coverAuto && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><Sparkles size={10} /> AUTO</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                    {extractingCover ? (
                                        <div className="w-32 h-24 rounded-xl bg-gray-100 flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={20} /></div>
                                    ) : coverPreview ? (
                                        <img src={coverPreview} alt="" className="w-32 h-24 object-cover rounded-xl border border-gray-200" />
                                    ) : null}
                                    <label className="px-4 py-2 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-500 text-sm font-semibold">
                                        Hitamo image
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePickCover} />
                                    </label>
                                </div>
                            </div>
                            <button type="submit" disabled={submitting}
                                className="w-full py-3 bg-primary-700 hover:bg-primary-800 text-white font-black rounded-2xl disabled:opacity-60 flex items-center justify-center gap-2">
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                Shyiramo PDF
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Video Upload Modal ── */}
            {showVideoForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="font-black text-white text-lg flex items-center gap-2"><Video size={18} /> Ongeza Video y'Inyigisho</h3>
                                <p className="text-red-200 text-sm">YouTube URL cyangwa video file yawe</p>
                            </div>
                            <button onClick={() => { setShowVideoForm(false); resetVideoForm(); }} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleVideoUpload} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Umwuga *</label>
                                    <select required value={videoForm.trade_code}
                                        onChange={e => setVideoForm(p => ({ ...p, trade_code: e.target.value, level: '' }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none">
                                        <option value="">-- Hitamo --</option>
                                        {trades.map(t => <option key={t.code} value={t.code}>{t.name_rw}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Urwego (Level) *</label>
                                    <select required value={videoForm.level}
                                        onChange={e => setVideoForm(p => ({ ...p, level: e.target.value }))}
                                        disabled={!selectedVideoTrade}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none disabled:bg-gray-100">
                                        <option value="">-- Hitamo --</option>
                                        {selectedVideoTrade?.levels.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Izina rya Video *</label>
                                <input required value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="urugero: Inyigisho ya 1 — JavaScript Basics"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none" maxLength={200} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Ubusobanuro (optional)</label>
                                <textarea value={videoForm.description} onChange={e => setVideoForm(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none" rows={2} />
                            </div>

                            {/* YouTube / External URL */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    🔗 YouTube / URL ya Video (Ihitamo 1)
                                </label>
                                <input type="url" value={videoForm.video_url}
                                    onChange={e => setVideoForm(p => ({ ...p, video_url: e.target.value }))}
                                    placeholder="https://youtube.com/watch?v=... cyangwa https://vimeo.com/..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none" />
                                {videoForm.video_url && getYouTubeId(videoForm.video_url) && (
                                    <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 aspect-video">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${getYouTubeId(videoForm.video_url)}`}
                                            className="w-full h-full" allowFullScreen title="Preview"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* OR upload file */}
                            <div className="relative">
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200" />
                                <p className="relative text-center text-xs font-bold text-gray-400 bg-white px-3 mx-auto w-fit">CYANGWA</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    📁 Shyiramo Video File (Ihitamo 2) — MP4, WebM, max 500 MB
                                </label>
                                <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30">
                                    <Video size={20} className="text-red-500" />
                                    <span className="text-sm font-semibold text-gray-700">
                                        {videoFile ? videoFile.name : 'Hitamo video file (MP4, WebM)'}
                                    </span>
                                    <input type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                                        className="hidden"
                                        onChange={e => setVideoFile(e.target.files?.[0] || null)} />
                                </label>
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                            <span>Irapakia...</span><span>{uploadProgress}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={submitting}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl disabled:opacity-60 flex items-center justify-center gap-2">
                                {submitting ? <><Loader2 size={18} className="animate-spin" /> Birakorwa... {uploadProgress > 0 ? `${uploadProgress}%` : ''}</> : <><Video size={18} /> Shyiramo Video</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherNotes;
