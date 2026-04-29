import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
    Car, BookOpen, Inbox, Search, SortAsc, Loader2, FileText,
    ShieldCheck, GraduationCap, ArrowLeft, Filter
} from 'lucide-react';
import NoteCard from '../../components/NoteCard';
import PdfReaderModal from '../../components/PdfReaderModal';

const TRADE_CODE = 'driving';

const DrivingRulesPage = () => {
    const { t } = useTranslation();
    const API_URL = import.meta.env.VITE_API_URL || '';
    const [trade, setTrade] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [activeLevel, setActiveLevel] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [reading, setReading] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const [tRes, listRes] = await Promise.all([
                    axios.get(`${API_URL}/api/course-notes/trades/${TRADE_CODE}`),
                    axios.get(`${API_URL}/api/course-notes`, { params: { trade_code: TRADE_CODE } })
                ]);
                if (cancelled) return;
                setTrade(tRes.data);
                setNotes(listRes.data);
            } catch (e) {
                if (!cancelled) setError(t('pub.kwiga.load_failed'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [API_URL, t]);

    const counts = useMemo(() => {
        const c = { all: notes.length };
        notes.forEach(n => { c[n.level] = (c[n.level] || 0) + 1; });
        return c;
    }, [notes]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        let arr = notes.filter(n => activeLevel === 'all' || n.level === activeLevel);
        if (q) arr = arr.filter(n =>
            n.title.toLowerCase().includes(q) ||
            (n.description || '').toLowerCase().includes(q) ||
            (n.uploaded_by_name || '').toLowerCase().includes(q)
        );
        if (sortBy === 'newest') arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        else if (sortBy === 'oldest') arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        else if (sortBy === 'title') arr.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortBy === 'popular') arr.sort((a, b) => (b.view_count || 0) + (b.download_count || 0) - ((a.view_count || 0) + (a.download_count || 0)));
        return arr;
    }, [notes, search, sortBy, activeLevel]);

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;
    }
    if (error || !trade) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                <p className="text-red-600 font-semibold mb-4">{error || t('pub.driving_rules.page_not_found')}</p>
                <Link to="/home" className="text-primary-700 font-bold underline">{t('pub.kwiga.back_home')}</Link>
            </div>
        );
    }

    const totalViews = notes.reduce((s, n) => s + (n.view_count || 0), 0);
    const totalDownloads = notes.reduce((s, n) => s + (n.download_count || 0), 0);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero */}
            <section className={`bg-gradient-to-br ${trade.color} text-white py-12 lg:py-16 relative overflow-hidden`}>
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <Link to="/home" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 font-semibold">
                        <ArrowLeft size={18} /> {t('pub.kwiga.back_home')}
                    </Link>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
                            <Car size={26} />
                        </div>
                        <span className="text-white/90 font-bold tracking-widest text-sm uppercase">{t('pub.driving_rules.section')}</span>
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-black mb-2">{trade.name_rw || t('pub.driving_rules.title_db')}</h1>
                    <p className="text-lg text-white/90 max-w-2xl">
                        {t('pub.driving_rules.subtitle')}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-3xl">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                            <p className="text-xs text-white/70 font-bold uppercase">{t('pub.driving_rules.stat_notes')}</p>
                            <p className="text-2xl font-black mt-0.5">{notes.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                            <p className="text-xs text-white/70 font-bold uppercase">{t('pub.driving_rules.stat_levels')}</p>
                            <p className="text-2xl font-black mt-0.5">{trade.levels.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                            <p className="text-xs text-white/70 font-bold uppercase">{t('pub.driving_rules.stat_views')}</p>
                            <p className="text-2xl font-black mt-0.5">{totalViews}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                            <p className="text-xs text-white/70 font-bold uppercase">{t('pub.driving_rules.stat_downloads')}</p>
                            <p className="text-2xl font-black mt-0.5">{totalDownloads}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info pills */}
            <section className="max-w-7xl mx-auto px-6 -mt-4 relative z-20">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 text-sm">{t('pub.driving_rules.info_road_title')}</p>
                            <p className="text-xs text-gray-500">{t('pub.driving_rules.info_road_desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 text-sm">{t('pub.driving_rules.info_notes_title')}</p>
                            <p className="text-xs text-gray-500">{t('pub.driving_rules.info_notes_desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 text-sm">{t('pub.driving_rules.info_exam_title')}</p>
                            <p className="text-xs text-gray-500">{t('pub.driving_rules.info_exam_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Toolbar + Notes */}
            <section className="max-w-7xl mx-auto px-6 py-8">
                {/* Level chips */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                    <Filter size={16} className="text-gray-500 flex-shrink-0" />
                    <button onClick={() => setActiveLevel('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                            activeLevel === 'all' ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-400'
                        }`}>
                        {t('pub.driving_rules.all_levels')} ({counts.all})
                    </button>
                    {trade.levels.map(l => (
                        <button key={l} onClick={() => setActiveLevel(l)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                                activeLevel === l ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-400'
                            }`}>
                            {l} ({counts[l] || 0})
                        </button>
                    ))}
                </div>

                {/* Search & sort */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('pub.driving_rules.search_placeholder')}
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        />
                    </div>
                    <div className="relative">
                        <SortAsc size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none">
                            <option value="newest">{t('pub.driving_rules.sort_newest')}</option>
                            <option value="oldest">{t('pub.driving_rules.sort_oldest')}</option>
                            <option value="title">{t('pub.driving_rules.sort_title')}</option>
                            <option value="popular">{t('pub.driving_rules.sort_popular')}</option>
                        </select>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <Inbox size={48} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-700 font-bold text-lg">
                            {notes.length === 0 ? t('pub.driving_rules.no_notes') : t('pub.driving_rules.no_results')}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            {notes.length === 0 ? t('pub.driving_rules.no_notes_desc') : t('pub.driving_rules.no_results_desc')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map(note => (
                            <NoteCard key={note.id} note={note} apiUrl={API_URL} onRead={setReading} />
                        ))}
                    </div>
                )}
            </section>

            {reading && <PdfReaderModal note={reading} apiUrl={API_URL} onClose={() => setReading(null)} />}
        </div>
    );
};

export default DrivingRulesPage;
