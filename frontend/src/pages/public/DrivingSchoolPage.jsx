import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Car, BookOpen, GraduationCap, CheckCircle, XCircle,
    ArrowRight, ArrowLeft, RotateCcw, Award, ChevronRight,
    StopCircle, AlertTriangle, Shield, Users, Eye, EyeOff,
    Phone, User, CreditCard, Lock, Mail, LogIn, UserPlus,
    Play, Clock, DollarSign, Calendar, MapPin, Star,
    Image, Video, FileText, Upload, Plus, Trash2, Edit,
    Bookmark, Target, TrendingUp, CheckSquare, Square, Info
} from 'lucide-react';
import axios from 'axios';

const API_URL = '/api/driving-school';

const COURSE_META = [
    { id: 1, category: 'theory',  duration_hours: 20, price: 0,     lessons_count: 15, enrolled_count: 1250 },
    { id: 2, category: 'theory',  duration_hours: 30, price: 25000, lessons_count: 20, enrolled_count: 890 },
    { id: 3, category: 'practice',duration_hours: 40, price: 35000, lessons_count: 25, enrolled_count: 1560 },
    { id: 4, category: 'practice',duration_hours: 50, price: 50000, lessons_count: 30, enrolled_count: 2100 },
    { id: 5, category: 'safety',  duration_hours: 15, price: 0,     lessons_count: 10, enrolled_count: 3200 },
    { id: 6, category: 'exam',    duration_hours: 25, price: 30000, lessons_count: 100, enrolled_count: 4500 }
];

const INSTRUCTOR_META = [
    { id: 1, phone: '0781234567', email: 'jean.mukamana@example.com', experience_years: 10, photo: null },
    { id: 2, phone: '0782345678', email: 'marie.umugrafi@example.com', experience_years: 8,  photo: null },
    { id: 3, phone: '0783456789', email: 'pierre.niyonkuru@example.com', experience_years: 15, photo: null }
];

const QUIZ_CORRECT = [2, 0, 1, 1, 1];

const AuthModal = ({ isOpen, onClose, mode, setMode, onLogin, role }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', nationalId: '', phone: '', email: '',
        password: '', confirmPassword: '', licenseNumber: '',
        specialization: '', experienceYears: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const tx = (k) => t(`pub.driving_school.auth.${k}`);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'register') {
            if (formData.password !== formData.confirmPassword) {
                setError(tx('err_password_mismatch'));
                return;
            }
            if (formData.nationalId.length < 16) {
                setError(tx('err_id_too_short'));
                return;
            }
        }

        setLoading(true);

        try {
            const userData = { ...formData, role, id: Date.now() };
            localStorage.setItem('drivingUser', JSON.stringify(userData));
            localStorage.setItem('drivingRole', role);
            onLogin(userData);
            onClose();
        } catch (err) {
            setError(tx('err_generic'));
        } finally {
            setLoading(false);
        }
    };

    const titleKey = role === 'instructor'
        ? (mode === 'login' ? 'login_instructor_title' : 'register_instructor_title')
        : (mode === 'login' ? 'login_learner_title' : 'register_learner_title');
    const subtitleKey = role === 'instructor'
        ? (mode === 'login' ? 'login_instructor_subtitle' : 'register_instructor_subtitle')
        : (mode === 'login' ? 'login_learner_subtitle' : 'register_learner_subtitle');

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XCircle size={24} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Car className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-black text-primary-800">{tx(titleKey)}</h2>
                    <p className="text-gray-600 text-sm mt-1">{tx(subtitleKey)}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{tx('first_name')}</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{tx('last_name')}</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500" />
                            </div>
                        </div>
                    )}

                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{tx('national_id')}</label>
                            <input type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} required minLength={16}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{tx('phone')}</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500" />
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{tx('email_optional')}</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500" />
                        </div>
                    )}

                    {role === 'instructor' && mode === 'register' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{tx('license_number')}</label>
                                <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{tx('specialization')}</label>
                                <select name="specialization" value={formData.specialization} onChange={handleChange} required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500">
                                    <option value="">{tx('specialization_placeholder')}</option>
                                    <option value="amategeko">{tx('spec_amategeko')}</option>
                                    <option value="ibirwanisho">{tx('spec_ibirwanisho')}</option>
                                    <option value="ibikoresho">{tx('spec_ibikoresho')}</option>
                                    <option value="imyitozo">{tx('spec_imyitozo')}</option>
                                    <option value="umutekano">{tx('spec_umutekano')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{tx('experience_years')}</label>
                                <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500" />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{tx('password')}</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required
                                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{tx('confirm_password')}</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500" />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold">{error}</div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50">
                        {loading ? tx('loading') : (mode === 'login' ? tx('login_btn') : tx('register_btn'))}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="text-primary-600 hover:text-primary-700 font-bold">
                        {mode === 'login' ? tx('switch_to_register') : tx('switch_to_login')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CourseCard = ({ course, onSelect, isEnrolled }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="h-40 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center relative">
                {course.thumbnail ? (
                    <img src={`/uploads/driving-courses/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                    <Car className="w-16 h-16 text-white/50" />
                )}
                <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-primary-700">
                    {course.duration_hours} {t('pub.driving_school.card.hours_unit')}
                </div>
            </div>
            <div className="p-6">
                <h3 className="font-black text-lg text-primary-800 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BookOpen size={16} />
                        <span>{course.lessons_count} {t('pub.driving_school.card.lessons_unit')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users size={16} />
                        <span>{course.enrolled_count} {t('pub.driving_school.card.enrolled_unit')}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="font-bold text-lg text-primary-600">
                        {course.price === 0 ? t('pub.driving_school.card.free') : `${course.price.toLocaleString()} Rwf`}
                    </div>
                    <button onClick={() => onSelect(course)}
                        className="px-6 py-2 bg-accent-500 text-primary-900 font-bold rounded-xl hover:bg-accent-400 transition-colors">
                        {isEnrolled ? t('pub.driving_school.card.enroll_more') : t('pub.driving_school.card.enroll')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DrivingSchoolPage = () => {
    const { t } = useTranslation();

    const courseTexts = t('pub.driving_school.courses_data', { returnObjects: true }) || [];
    const instructorTexts = t('pub.driving_school.instructors_data', { returnObjects: true }) || [];
    const quizTexts = t('pub.driving_school.quiz_data', { returnObjects: true }) || [];

    const courses = COURSE_META.map((m, i) => ({
        ...m,
        title: courseTexts[i]?.title || '',
        description: courseTexts[i]?.description || '',
        thumbnail: null
    }));

    const instructors = INSTRUCTOR_META.map((m, i) => ({
        ...m,
        first_name: instructorTexts[i]?.first_name || '',
        last_name: instructorTexts[i]?.last_name || '',
        specialization: instructorTexts[i]?.specialization || '',
        bio: instructorTexts[i]?.bio || ''
    }));

    const quizQuestions = quizTexts.map((q, i) => ({
        question: q.question,
        options: q.options || [],
        correct: QUIZ_CORRECT[i] ?? 0,
        explanation: q.explanation
    }));

    const [user, setUser] = useState(null);
    const [role, setRole] = useState('learner');
    const [activeTab, setActiveTab] = useState('courses');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showCourseDetail, setShowCourseDetail] = useState(false);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [realLessons, setRealLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [pdfViewer, setPdfViewer] = useState(null);

    useEffect(() => {
        if (!showCourseDetail || !selectedCourse?.id) {
            setRealLessons([]);
            return;
        }
        setLoadingLessons(true);
        fetch(`/api/driving-school/courses/${selectedCourse.id}/lessons`)
            .then(r => r.json())
            .then(d => setRealLessons(d?.data || []))
            .catch(() => setRealLessons([]))
            .finally(() => setLoadingLessons(false));
    }, [showCourseDetail, selectedCourse?.id]);

    useEffect(() => {
        const savedUser = localStorage.getItem('drivingUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setRole(localStorage.getItem('drivingRole') || 'learner');
        }
    }, []);

    const handleLogin = (userData) => setUser(userData);

    const handleLogout = () => {
        localStorage.removeItem('drivingUser');
        localStorage.removeItem('drivingRole');
        setUser(null);
    };

    const handleSelectCourse = (course) => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        setSelectedCourse(course);
        setShowCourseDetail(true);
        if (!enrolledCourses.includes(course.id)) {
            setEnrolledCourses([...enrolledCourses, course.id]);
        }
    };

    const handleQuizSubmit = () => {
        let score = 0;
        quizQuestions.forEach((q, index) => {
            if (quizAnswers[index] === q.correct) score++;
        });
        const percentage = Math.round((score / quizQuestions.length) * 100);
        setQuizResult({
            score,
            total: quizQuestions.length,
            percentage,
            passed: percentage >= 70
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black flex items-center gap-3">
                                <Car className="w-10 h-10" />
                                {t('pub.driving_school.hero.title')}
                            </h1>
                            <p className="text-primary-200 mt-2 text-lg">
                                {t('pub.driving_school.hero.subtitle')}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {user ? (
                                <div className="flex items-center gap-4 bg-white/10 px-6 py-3 rounded-2xl">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{user.firstName} {user.lastName}</p>
                                        <p className="text-sm text-primary-200">
                                            {user.role === 'instructor'
                                                ? t('pub.driving_school.hero.instructor_role')
                                                : t('pub.driving_school.hero.learner_role')}
                                        </p>
                                    </div>
                                    <button onClick={handleLogout}
                                        className="ml-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm font-bold">
                                        {t('pub.driving_school.hero.logout')}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => { setRole('learner'); setShowAuthModal(true); }}
                                        className="px-8 py-3 bg-white text-primary-700 font-bold rounded-2xl hover:bg-gray-100 transition-all">
                                        <LogIn className="inline-block w-5 h-5 mr-2" />
                                        {t('pub.driving_school.hero.login_btn')}
                                    </button>
                                    <button onClick={() => { setRole('instructor'); setShowAuthModal(true); }}
                                        className="px-8 py-3 bg-accent-500 text-primary-900 font-bold rounded-2xl hover:bg-accent-400 transition-all">
                                        <UserPlus className="inline-block w-5 h-5 mr-2" />
                                        {t('pub.driving_school.hero.instructor_btn')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-2 overflow-x-auto py-2">
                        {[
                            { id: 'courses', label: t('pub.driving_school.tabs.courses'), icon: BookOpen },
                            { id: 'instructors', label: t('pub.driving_school.tabs.instructors'), icon: Users },
                            { id: 'about', label: t('pub.driving_school.tabs.about'), icon: Info }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-primary-50'}`}>
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'courses' && (
                    <div>
                        <h2 className="text-2xl font-black text-primary-800 mb-6 flex items-center gap-3">
                            <GraduationCap className="w-8 h-8" />
                            {t('pub.driving_school.courses_section.title')}
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => (
                                <CourseCard key={course.id} course={course}
                                    onSelect={handleSelectCourse}
                                    isEnrolled={enrolledCourses.includes(course.id)} />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'instructors' && (
                    <div>
                        <h2 className="text-2xl font-black text-primary-800 mb-6 flex items-center gap-3">
                            <Users className="w-8 h-8" />
                            {t('pub.driving_school.instructors_section.title')}
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {instructors.map(instructor => (
                                <div key={instructor.id} className="bg-white rounded-3xl p-6 shadow-lg">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                            <User className="w-8 h-8 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-primary-800">
                                                {instructor.first_name} {instructor.last_name}
                                            </h3>
                                            <p className="text-primary-600 font-medium">{instructor.specialization}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-4">{instructor.bio}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            <span className="font-bold">{instructor.experience_years} {t('pub.driving_school.instructors_section.years')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Phone className="w-4 h-4" />
                                            <span>{instructor.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="bg-white rounded-3xl p-8 shadow-lg">
                        <h2 className="text-2xl font-black text-primary-800 mb-6">{t('pub.driving_school.about.title')}</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 bg-primary-50 rounded-2xl">
                                <Target className="w-12 h-12 text-primary-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-lg text-primary-800 mb-2">{t('pub.driving_school.about.mission_title')}</h3>
                                    <p className="text-gray-600">{t('pub.driving_school.about.mission_text')}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-primary-50 rounded-2xl">
                                <TrendingUp className="w-12 h-12 text-primary-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-lg text-primary-800 mb-2">{t('pub.driving_school.about.services_title')}</h3>
                                    <p className="text-gray-600">{t('pub.driving_school.about.services_text')}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-primary-50 rounded-2xl">
                                <Award className="w-12 h-12 text-primary-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-lg text-primary-800 mb-2">{t('pub.driving_school.about.results_title')}</h3>
                                    <p className="text-gray-600">{t('pub.driving_school.about.results_text')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Course Detail Modal */}
            {showCourseDetail && selectedCourse && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto relative">
                        <button onClick={() => setShowCourseDetail(false)} className="absolute top-4 right-4 text-gray-400">
                            <XCircle size={24} />
                        </button>

                        <h2 className="text-2xl font-black text-primary-800 mb-4">{selectedCourse.title}</h2>
                        <p className="text-gray-600 mb-6">{selectedCourse.description}</p>

                        <div className="flex flex-wrap gap-4 mb-6">
                            <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-xl">
                                <Clock className="w-5 h-5 text-primary-600" />
                                <span className="font-bold">{selectedCourse.duration_hours} {t('pub.driving_school.card.hours_unit')}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-xl">
                                <BookOpen className="w-5 h-5 text-primary-600" />
                                <span className="font-bold">{selectedCourse.lessons_count} {t('pub.driving_school.card.lessons_unit')}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-xl">
                                <Users className="w-5 h-5 text-primary-600" />
                                <span className="font-bold">{selectedCourse.enrolled_count} {t('pub.driving_school.card.enrolled_unit')}</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <h3 className="font-bold text-lg text-primary-800">{t('pub.driving_school.course_detail.lessons_title')}</h3>
                            {loadingLessons ? (
                                <p className="text-center text-gray-400 py-6">{t('pub.driving_school.course_detail.loading')}</p>
                            ) : realLessons.length === 0 ? (
                                <p className="text-center text-gray-400 py-6 italic">{t('pub.driving_school.course_detail.no_lessons')}</p>
                            ) : (
                                realLessons.map((lesson, i) => (
                                    <div key={lesson.id}
                                        className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                                        {lesson.image_url ? (
                                            <img src={lesson.image_url} alt="" className="w-full sm:w-32 h-24 object-cover rounded-lg flex-shrink-0" />
                                        ) : (
                                            <div className="w-full sm:w-32 h-24 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-black text-2xl flex-shrink-0">
                                                {i + 1}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800">{lesson.title_kinya || lesson.title}</h4>
                                            {lesson.description && <p className="text-sm text-gray-600 mt-1 line-clamp-3">{lesson.description}</p>}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {lesson.duration_minutes > 0 && (
                                                    <span className="text-xs bg-white px-2 py-1 rounded-full border text-gray-600">
                                                        <Clock className="w-3 h-3 inline mr-1" />
                                                        {lesson.duration_minutes} {t('pub.driving_school.course_detail.min_unit')}
                                                    </span>
                                                )}
                                                {lesson.pdf_url && (
                                                    <button onClick={() => setPdfViewer({ url: lesson.pdf_url, title: lesson.title_kinya || lesson.title })}
                                                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> {t('pub.driving_school.course_detail.read_pdf')}
                                                    </button>
                                                )}
                                                {lesson.video_url && (
                                                    <a href={lesson.video_url} target="_blank" rel="noreferrer"
                                                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                                        <Play className="w-3 h-3" /> {t('pub.driving_school.course_detail.video')}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button onClick={() => setShowQuiz(true)}
                            className="w-full py-4 bg-gradient-to-r from-accent-500 to-accent-400 text-primary-900 font-bold rounded-xl hover:from-accent-400 hover:to-accent-500 transition-all">
                            <GraduationCap className="inline-block w-5 h-5 mr-2" />
                            {t('pub.driving_school.course_detail.take_quiz')}
                        </button>
                    </div>
                </div>
            )}

            {/* Quiz Modal */}
            {showQuiz && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto relative">
                        <button onClick={() => { setShowQuiz(false); setQuizResult(null); setQuizAnswers({}); }}
                            className="absolute top-4 right-4 text-gray-400">
                            <XCircle size={24} />
                        </button>

                        <h2 className="text-2xl font-black text-primary-800 mb-6 flex items-center gap-3">
                            <GraduationCap className="w-8 h-8" />
                            {t('pub.driving_school.quiz.title')}
                        </h2>

                        {!quizResult ? (
                            <div className="space-y-6">
                                {quizQuestions.map((q, qIndex) => (
                                    <div key={qIndex} className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="font-bold text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt, oIndex) => (
                                                <button key={oIndex}
                                                    onClick={() => setQuizAnswers({ ...quizAnswers, [qIndex]: oIndex })}
                                                    className={`w-full p-3 rounded-xl text-left font-medium transition-all ${quizAnswers[qIndex] === oIndex ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-primary-50 border border-gray-200'}`}>
                                                    <span className="inline-block w-8 h-8 rounded-full bg-white/20 text-center leading-8 mr-2">
                                                        {String.fromCharCode(65 + oIndex)}
                                                    </span>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleQuizSubmit}
                                    disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                                    className="w-full py-4 bg-accent-500 text-primary-900 font-bold rounded-xl disabled:opacity-50">
                                    {t('pub.driving_school.quiz.submit')}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${quizResult.passed ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                    <Award className={`w-12 h-12 ${quizResult.passed ? 'text-green-600' : 'text-yellow-600'}`} />
                                </div>
                                <h3 className="text-2xl font-black text-primary-800 mb-2">
                                    {t('pub.driving_school.quiz.score')}: {quizResult.score} / {quizResult.total}
                                </h3>
                                <p className="text-xl text-gray-600 mb-6">{quizResult.percentage}{t('pub.driving_school.quiz.percent')}</p>
                                <p className={`text-lg font-bold mb-6 ${quizResult.passed ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {quizResult.passed ? t('pub.driving_school.quiz.passed') : t('pub.driving_school.quiz.failed')}
                                </p>
                                <button onClick={() => { setQuizResult(null); setQuizAnswers({}); }}
                                    className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl">
                                    <RotateCcw className="inline-block w-5 h-5 mr-2" />
                                    {t('pub.driving_school.quiz.retry')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}
                mode={authMode} setMode={setAuthMode} onLogin={handleLogin} role={role} />

            {/* Lesson PDF Viewer Modal */}
            {pdfViewer && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex flex-col">
                    <div className="bg-primary-800 text-white px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            <h3 className="font-bold truncate">{pdfViewer.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={pdfViewer.url} download
                                className="text-xs sm:text-sm px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-bold flex items-center gap-1">
                                <Image className="w-4 h-4" /> {t('pub.driving_school.course_detail.download')}
                            </a>
                            <button onClick={() => setPdfViewer(null)}
                                className="p-2 hover:bg-white/20 rounded-lg">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    <iframe src={pdfViewer.url} title={pdfViewer.title} className="flex-1 w-full bg-gray-900" />
                </div>
            )}
        </div>
    );
};

export default DrivingSchoolPage;
