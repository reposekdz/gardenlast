import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { contentAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const ContactPage = () => {
    const { t } = useTranslation();
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await contentAPI.getSchoolInfo('contact');
                setSchoolInfo(res.data);
            } catch (error) {
                console.error('Failed to fetch contact info');
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await contentAPI.submitContact(form);
            toast.success(t('pub.contact.send_success'));
            setSent(true);
            setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) {
            toast.error(t('pub.contact.send_failed'));
        } finally {
            setLoading(false);
        }
    };

    const contacts = [
        { icon: MapPin, label: t('pub.contact.label_location'), value: schoolInfo?.location || t('pub.contact.default_location') },
        { icon: Phone,  label: t('pub.contact.label_phone'),    value: schoolInfo?.phone    || '+250 780 000 000' },
        { icon: Mail,   label: t('pub.contact.label_email'),    value: schoolInfo?.email    || 'info@gardentvet.rw' },
        { icon: Clock,  label: t('pub.contact.label_hours'),    value: schoolInfo?.opening_hours || t('pub.contact.default_hours') },
    ];

    return (
        <div>
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-900 py-20 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                <h1 className="text-5xl font-black mb-4 relative z-10">{t('pub.contact.title')}</h1>
                <p className="text-primary-200 text-lg relative z-10">{t('pub.contact.subtitle')}</p>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-start">
                {/* Contact Info */}
                <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-8">{t('pub.contact.info_title')}</h2>
                    <div className="space-y-5">
                        {contacts.map((c, i) => {
                            const Icon = c.icon;
                            return (
                                <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600 transition-colors">
                                        <Icon size={20} className="text-primary-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{c.label}</p>
                                        <p className="font-bold text-gray-900">{c.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Map placeholder */}
                    <div className="mt-8 rounded-2xl overflow-hidden border border-gray-100 h-56 bg-primary-50 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <MapPin size={40} className="mx-auto mb-2 text-primary-300" />
                            <p className="text-sm">{t('pub.contact.default_location')}</p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {sent ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{t('pub.contact.thanks_title')}</h3>
                            <p className="text-gray-500">{t('pub.contact.thanks_desc')}</p>
                            <button onClick={() => setSent(false)} className="mt-6 px-6 py-2 bg-primary-600 text-white font-bold rounded-xl text-sm hover:bg-primary-700 transition-colors">
                                {t('pub.contact.send_another')}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
                                <h2 className="text-xl font-black text-white">{t('pub.contact.form_title')}</h2>
                                <p className="text-primary-200 text-sm mt-1">{t('pub.contact.form_subtitle')}</p>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('pub.contact.name')} *</label>
                                    <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm transition-all"
                                        placeholder={t('pub.contact.name_placeholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('pub.contact.email')} *</label>
                                    <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm transition-all"
                                        placeholder={t('pub.contact.email_placeholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('pub.contact.message')} *</label>
                                    <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm transition-all resize-none"
                                        placeholder={t('pub.contact.message_placeholder')} />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-60">
                                    {loading ? t('pub.contact.sending') : t('pub.contact.send')} <Send size={18} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
