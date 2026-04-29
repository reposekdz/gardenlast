import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import RWANDA_LOCATIONS from '../../utils/rwandaLocations';
import { GraduationCap, Phone, Lock, User, MapPin, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        first_name: '', last_name: '', phone: '', password: '', confirm_password: '',
        province: '', district: '', sector: ''
    });

    const provinces = Object.keys(RWANDA_LOCATIONS);
    const districts = form.province ? Object.keys(RWANDA_LOCATIONS[form.province] || {}) : [];
    const sectors = (form.province && form.district) ? (RWANDA_LOCATIONS[form.province]?.[form.district] || []) : [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'province' ? { district: '', sector: '' } : {}),
            ...(name === 'district' ? { sector: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm_password) {
            return toast.error(t('register.passwords_no_match'));
        }
        if (form.phone.length < 10) {
            return toast.error(t('register.invalid_phone'));
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/register-parent`, {
                first_name: form.first_name,
                last_name: form.last_name,
                phone: form.phone,
                password: form.password,
                province: form.province,
                district: form.district,
                sector: form.sector,
            });
            toast.success(t('register.account_created'));
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || t('register.register_failed'));
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm transition-all bg-white";
    const selectClass = `${inputClass} appearance-none`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/home" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 mb-6">
                        <ArrowLeft size={16} /> {t('common.back_home')}
                    </Link>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30">
                        <GraduationCap size={36} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">{t('register.title')}</h1>
                    <p className="text-gray-500 mt-2">{t('register.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-5">
                        <h2 className="text-white font-black text-lg">{t('register.your_info')}</h2>
                        <p className="text-primary-200 text-sm">{t('register.info_note')}</p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Name */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <User size={14} className="inline mr-1" />{t('register.first_name')} *
                                </label>
                                <input required name="first_name" value={form.first_name} onChange={handleChange}
                                    className={inputClass} placeholder="Jean Pierre" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <User size={14} className="inline mr-1" />{t('register.last_name')} *
                                </label>
                                <input required name="last_name" value={form.last_name} onChange={handleChange}
                                    className={inputClass} placeholder="Mugisha" />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Phone size={14} className="inline mr-1" />{t('register.phone_label')} * <span className="font-normal text-gray-400">{t('register.phone_hint')}</span>
                            </label>
                            <input required name="phone" value={form.phone} onChange={handleChange}
                                type="tel" maxLength={13}
                                className={inputClass} placeholder="0780000000" />
                            <p className="text-xs text-gray-400 mt-1">📱 {t('register.sms_hint')}</p>
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <Lock size={14} className="inline mr-1" />{t('register.new_password')} *
                                </label>
                                <div className="relative">
                                    <input required name="password" value={form.password} onChange={handleChange}
                                        type={showPassword ? 'text' : 'password'}
                                        className={`${inputClass} pr-11`} placeholder="••••••••" minLength={6} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <Lock size={14} className="inline mr-1" />{t('register.confirm_password')} *
                                </label>
                                <input required name="confirm_password" value={form.confirm_password} onChange={handleChange}
                                    type="password"
                                    className={inputClass} placeholder="••••••••" />
                            </div>
                        </div>

                        {/* Rwanda Location */}
                        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6">
                            <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-primary-600" />
                                {t('register.rwanda_address')}
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('register.province')} *</label>
                                    <select required name="province" value={form.province} onChange={handleChange} className={selectClass}>
                                        <option value="">{t('register.select_province')}</option>
                                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('register.district')} *</label>
                                    <select required name="district" value={form.district} onChange={handleChange}
                                        className={selectClass} disabled={!form.province}>
                                        <option value="">{t('register.select_district')}</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('register.sector')} *</label>
                                    <select required name="sector" value={form.sector} onChange={handleChange}
                                        className={selectClass} disabled={!form.district}>
                                        <option value="">{t('register.select_sector')}</option>
                                        {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-lg rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary-500/30 disabled:opacity-60">
                            {loading ? (
                                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('register.creating')}</>
                            ) : <>{t('register.register_now')}</>}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            {t('register.have_account')} <Link to="/login" className="text-primary-600 font-bold hover:underline">{t('register.login_here')}</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
