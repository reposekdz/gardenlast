import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import {
    ArrowLeft, ArrowRight, Award, BookOpen, Code, Wrench, Hammer, Briefcase,
    Users, Calendar, Clock, MapPin, Phone, Image,
    Star, CheckCircle, GraduationCap, ChevronDown,
    X, Info
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const TRADE_IMAGES = {
    'Software Development': `${API_URL}/uploads/trade card image/sod.jpg`,
    'Automobile Technology': `${API_URL}/uploads/trade card image/auto.jpg`,
    'Building and Construction': `${API_URL}/uploads/trade card image/bdc.jpg`,
};

const TRADE_ICONS = {
    'Software Development': Code,
    'Automobile Technology': Wrench,
    'Building and Construction': Hammer,
};

const MODULE_HOURS = {
    'Software Development': [120, 150, 130, 140, 160, 180],
    'Automobile Technology': [140, 160, 150, 140, 170, 120],
    'Building and Construction': [150, 170, 160, 140, 180, 120],
};

const TradeDetailsPage = () => {
    const { t } = useTranslation();
    const { tradeName } = useParams();
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const [activeTab, setActiveTab] = useState('overview');
    const [gallery, setGallery] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [, setLoading] = useState(true);
    const [expandedModule, setExpandedModule] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                try {
                    const galleryRes = await axios.get(`${API_URL}/api/content/galleries?trade_name=${tradeName}`, { headers });
                    setGallery(galleryRes.data || []);
                } catch (e) {
                    // gallery not available
                }
            } catch (err) {
                // ignore
            }
            setLoading(false);
        };
        fetchData();
    }, [tradeName, token]);

    const tradeData = t(`pub.trade_details.trades.${tradeName}`, { returnObjects: true });
    const isValidTrade = tradeData && typeof tradeData === 'object' && tradeData.name;

    if (!isValidTrade) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">{t('pub.trade_details.not_found')}</h2>
                    <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700">
                        {t('pub.trade_details.back_home')}
                    </button>
                </div>
            </div>
        );
    }

    const IconComponent = TRADE_ICONS[tradeName] || Code;
    const tradeImage = TRADE_IMAGES[tradeName];
    const moduleHours = MODULE_HOURS[tradeName] || [];
    const categories = ['all', ...new Set(gallery.map(g => g.category).filter(Boolean))];
    const displayGallery = gallery.length > 0 ? gallery : [];
    const filteredGallery = filterCategory === 'all'
        ? displayGallery
        : displayGallery.filter(g => g.category === filterCategory);

    const allTrades = t('pub.trade_details.trades', { returnObjects: true }) || {};
    const otherTradeKeys = Object.keys(allTrades).filter(k => k !== tradeName);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <div className="relative h-72 md:h-96 bg-gray-900 overflow-hidden">
                <img src={tradeImage} alt={tradeData.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
                <div className="absolute top-4 left-4 md:top-6 md:left-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft size={20} /> {t('pub.trade_details.back')}
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full">
                                {t('pub.trade_details.tvet_program')}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-3">{tradeData.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/80">
                            <span className="flex items-center gap-2">
                                <Clock size={18} /> {tradeData.duration}
                            </span>
                            <span className="flex items-center gap-2">
                                <Award size={18} /> {tradeData.certification}
                            </span>
                            <span className="flex items-center gap-2">
                                <MapPin size={18} /> {t('pub.trade_details.qi_loc_val')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-20 relative z-10">
                    <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-2xl font-black text-gray-800">450+</p>
                        <p className="text-gray-500 text-sm">{t('pub.trade_details.students_enrolled')}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-2xl font-black text-gray-800">92%</p>
                        <p className="text-gray-500 text-sm">{t('pub.trade_details.job_placement')}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-2xl font-black text-gray-800">60%</p>
                        <p className="text-gray-500 text-sm">{t('pub.trade_details.practical_training')}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-2xl font-black text-gray-800">25+</p>
                        <p className="text-gray-500 text-sm">{t('pub.trade_details.industry_partners')}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-2 shadow-sm flex overflow-x-auto gap-1">
                            {[
                                { id: 'overview', label: t('pub.trade_details.overview'), icon: Info },
                                { id: 'curriculum', label: t('pub.trade_details.curriculum'), icon: BookOpen },
                                { id: 'gallery', label: t('pub.trade_details.gallery'), icon: Image },
                                { id: 'careers', label: t('pub.trade_details.careers_tab'), icon: Briefcase },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('pub.trade_details.about_program')}</h2>
                                    <p className="text-gray-600 leading-relaxed">{tradeData.description}</p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('pub.trade_details.what_youll_learn')}</h2>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {(tradeData.highlights || []).map((highlight, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                                <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="font-semibold text-gray-700">{highlight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('pub.trade_details.skills_youll_gain')}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {(tradeData.skills || []).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">{t('pub.trade_details.ready_to_start')}</h3>
                                            <p className="text-green-100">{t('pub.trade_details.join_garden')}</p>
                                        </div>
                                        <Link
                                            to="/apply"
                                            className="px-8 py-3 bg-white text-green-700 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                                        >
                                            {t('pub.trade_details.apply_now')} <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'curriculum' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">{t('pub.trade_details.course_modules')}</h2>
                                    <p className="text-gray-500 mb-6">{t('pub.trade_details.curriculum_desc')}</p>

                                    <div className="space-y-3">
                                        {(tradeData.modules || []).map((module, idx) => (
                                            <div
                                                key={idx}
                                                className={`border-2 rounded-xl overflow-hidden transition-all ${expandedModule === idx ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                                                    className="w-full flex items-center justify-between p-4 text-left"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-green-600 text-white font-bold flex items-center justify-center">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-800">{module.name}</h3>
                                                            <p className="text-sm text-gray-500">{module.level} • {moduleHours[idx] || 120} {t('pub.trade_details.hours')}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedModule === idx ? 'rotate-180' : ''}`} />
                                                </button>
                                                {expandedModule === idx && (
                                                    <div className="px-4 pb-4 pt-0">
                                                        <p className="text-gray-600 pl-14">{module.description}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'gallery' && (
                            <div className="animate-fade-in">
                                {displayGallery.length > 0 ? (
                                    <>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setFilterCategory(cat)}
                                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${filterCategory === cat
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {filteredGallery.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg"
                                                    onClick={() => setSelectedImage(item)}
                                                >
                                                    <img
                                                        src={item.image_url || item.url}
                                                        alt={item.title}
                                                        className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                                            <p className="text-white font-bold">{item.title}</p>
                                                            <p className="text-white/70 text-sm capitalize">{item.category || t('pub.trade_details.gallery')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                                        <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-600 mb-2">{t('pub.trade_details.gallery_coming')}</h3>
                                        <p className="text-gray-400">{t('pub.trade_details.gallery_check_back')}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'careers' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('pub.trade_details.career_opps')}</h2>
                                    <p className="text-gray-500 mb-6">{t('pub.trade_details.career_desc')}</p>

                                    <div className="grid md:grid-cols-2 gap-3">
                                        {(tradeData.careers || []).map((career, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                                <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                                                    <Briefcase className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="font-semibold text-gray-700">{career}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">{t('pub.trade_details.grad_employment')}</h3>
                                            <p className="text-green-100">{t('pub.trade_details.grad_desc')}</p>
                                        </div>
                                        <div className="relative w-24 h-24">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                                                <circle cx="48" cy="48" r="40" stroke="white" strokeWidth="8" fill="none"
                                                    strokeDasharray="251" strokeDashoffset="20" strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-2xl font-black">92%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('pub.trade_details.apply_program')}</h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-xl">
                                    <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                                        <CheckCircle size={18} /> {t('pub.trade_details.entry_req')}
                                    </h4>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        <li>• {t('pub.trade_details.req1')}</li>
                                        <li>• {t('pub.trade_details.req2')}</li>
                                        <li>• {t('pub.trade_details.req3')}</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                        <Clock size={18} /> {t('pub.trade_details.duration_label')}
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• {tradeData.duration}</li>
                                        <li>• {t('pub.trade_details.dur1')}</li>
                                        <li>• {t('pub.trade_details.dur2')}</li>
                                    </ul>
                                </div>

                                <Link
                                    to={`/apply?trade=${encodeURIComponent(tradeName)}`}
                                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <GraduationCap size={20} />
                                    {t('pub.trade_details.start_app')}
                                </Link>

                                <Link
                                    to="/contact"
                                    className="w-full py-3 border-2 border-green-600 text-green-700 rounded-xl font-bold hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Phone size={18} />
                                    {t('pub.trade_details.contact_us')}
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h4 className="font-bold text-gray-800 mb-4">{t('pub.trade_details.quick_info')}</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">{t('pub.trade_details.qi_level')}</span>
                                    <span className="font-semibold">{t('pub.trade_details.qi_certificate')}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">{t('pub.trade_details.qi_duration')}</span>
                                    <span className="font-semibold">{t('pub.trade_details.qi_3y')}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">{t('pub.trade_details.qi_cert')}</span>
                                    <span className="font-semibold">{t('pub.trade_details.qi_tvet')}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-gray-500">{t('pub.trade_details.qi_location')}</span>
                                    <span className="font-semibold">{t('pub.trade_details.qi_loc_val')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h4 className="font-bold text-gray-800 mb-4">{t('pub.trade_details.other_programs')}</h4>
                            <div className="space-y-3">
                                {otherTradeKeys.map(otherKey => {
                                    const otherTrade = allTrades[otherKey];
                                    return (
                                        <Link
                                            key={otherKey}
                                            to={`/services/${otherKey}`}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <img
                                                src={TRADE_IMAGES[otherKey]}
                                                alt={otherTrade?.name || otherKey}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            <span className="font-medium text-gray-700">{otherTrade?.name || otherKey}</span>
                                            <ArrowRight size={16} className="ml-auto text-gray-400" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full">
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={selectedImage.image_url || selectedImage.url}
                        alt={selectedImage.title}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    />
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                        <p className="text-white font-bold text-lg">{selectedImage.title}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeDetailsPage;
