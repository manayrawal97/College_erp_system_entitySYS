import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineBookOpen, HiOutlineChatAlt2, HiCheck, HiArrowRight } from 'react-icons/hi';

const InquiryForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        course: '',
        message: '',
        subscribe: false,
        captcha: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [captchaQuestion, setCaptchaQuestion] = useState({ a: 0, b: 0, sum: 0 });

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        setCaptchaQuestion({ a, b, sum: a + b });
    };

    const validate = () => {
        let newErrors = {};
        if (formData.fullName.length < 3) newErrors.fullName = 'Please enter your full name';
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email required';
        if (formData.message.length < 20) newErrors.message = 'Please provide more details (min 20 chars)';
        if (parseInt(formData.captcha) !== captchaQuestion.sum) newErrors.captcha = 'Incorrect';
        if (!formData.course) newErrors.course = 'Select a program';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            course: '',
            message: '',
            subscribe: false,
            captcha: ''
        });
        generateCaptcha();
        setTimeout(() => setIsSuccess(false), 5000);
    };

    return (
        <section className="section-padding bg-white relative overflow-hidden" id="inquiry">
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="bg-primary rounded-3xl lg:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">

                    {/* Content Side */}
                    <div className="lg:w-2/5 p-6 sm:p-10 md:p-16 lg:p-20 text-white flex flex-col justify-between">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary to-accent rounded-3xl flex items-center justify-center text-3xl sm:text-4xl mb-6 sm:mb-12 shadow-2xl"
                            >
                                <HiOutlineChatAlt2 />
                            </motion.div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 sm:mb-8 leading-tight tracking-tighter">
                                Let's build the <br />
                                <span className="text-secondary">future</span> together.
                            </h2>

                            <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-12 font-medium">
                                Join the elite institutions transforming their academic infrastructure with EntitySYS.
                            </p>
                        </div>

                        <div className="space-y-6 sm:space-y-8 mt-auto">
                            {[
                                { label: 'Campus Line', val: '+91 98765 43210', icon: HiOutlinePhone },
                                { label: 'Official Inquiry', val: 'admissions@entitysys.edu', icon: HiOutlineMail },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center space-x-4 sm:space-x-6 group cursor-pointer">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 glass rounded-2xl flex items-center justify-center text-xl sm:text-2xl group-hover:bg-secondary group-hover:text-white transition-all shrink-0">
                                        <item.icon />
                                    </div>
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.label}</p>
                                        <p className="text-sm sm:text-lg md:text-xl font-bold text-white break-all sm:break-normal">{item.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="lg:w-3/5 p-6 sm:p-10 md:p-16 lg:p-20 bg-slate-50">
                        <div className="relative">
                            <AnimatePresence>
                                {isSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                                        animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white/80 z-30 flex flex-col items-center justify-center text-center p-6 sm:p-10 rounded-3xl"
                                    >
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl mb-6 shadow-2xl animate-bounce">
                                            <HiCheck />
                                        </div>
                                        <h3 className="text-2xl sm:text-3xl font-black text-primary mb-4">Inquiry Received!</h3>
                                        <p className="text-gray-500 font-medium mb-8">Our institutional specialists will reach out to you within 2 business hours.</p>
                                        <button
                                            onClick={() => setIsSuccess(false)}
                                            className="text-secondary font-black hover:underline"
                                        >
                                            New Inquiry
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    {/* Full Name */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <HiOutlineUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xl group-focus-within:text-secondary transition-colors" />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="Dr. James Wilson"
                                                className={`w-full pl-14 pr-6 py-4 sm:py-5 rounded-2xl border-2 ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-white bg-white shadow-sm'} focus:border-secondary transition-all outline-none font-bold text-primary placeholder:text-gray-300`}
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                        <div className="relative group">
                                            <HiOutlineMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xl group-focus-within:text-secondary transition-colors" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="james@university.edu"
                                                className={`w-full pl-14 pr-6 py-4 sm:py-5 rounded-2xl border-2 ${errors.email ? 'border-red-500 bg-red-50' : 'border-white bg-white shadow-sm'} focus:border-secondary transition-all outline-none font-bold text-primary placeholder:text-gray-300`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    {/* Course */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Institutional Program</label>
                                        <div className="relative group">
                                            <HiOutlineBookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xl pointer-events-none" />
                                            <select
                                                name="course"
                                                value={formData.course}
                                                onChange={handleChange}
                                                className={`w-full pl-14 pr-6 py-4 sm:py-5 rounded-2xl border-2 ${errors.course ? 'border-red-500 bg-red-50' : 'border-white bg-white shadow-sm'} focus:border-secondary transition-all outline-none font-bold text-primary appearance-none cursor-pointer`}
                                            >
                                                <option value="">Select Category</option>
                                                <option value="B.Tech">Engineering (B.Tech)</option>
                                                <option value="MBA">Management (MBA)</option>
                                                <option value="Research">Research & PhD</option>
                                                <option value="Medical">Medical Sciences</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Captcha */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Verification: {captchaQuestion.a} + {captchaQuestion.b}</label>
                                        <input
                                            type="number"
                                            name="captcha"
                                            value={formData.captcha}
                                            onChange={handleChange}
                                            placeholder="Answer"
                                            className={`w-full px-6 py-4 sm:py-5 rounded-2xl border-2 ${errors.captcha ? 'border-red-500 bg-red-50' : 'border-white bg-white shadow-sm'} focus:border-secondary transition-all outline-none font-bold text-primary`}
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-2 sm:space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Institutional Vision</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Describe your institutional requirements..."
                                        className={`w-full px-6 sm:px-8 py-5 sm:py-6 rounded-3xl border-2 ${errors.message ? 'border-red-500 bg-red-50' : 'border-white bg-white shadow-sm'} focus:border-secondary transition-all outline-none font-bold text-primary resize-none placeholder:text-gray-300`}
                                    ></textarea>
                                </div>

                                {/* Newsletter & Submit */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 pt-4">
                                    <label className="flex items-center space-x-4 cursor-pointer group w-full sm:w-auto">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                name="subscribe"
                                                checked={formData.subscribe}
                                                onChange={handleChange}
                                                className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 transition-all checked:border-secondary checked:bg-secondary"
                                            />
                                            <HiCheck className="absolute left-1 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-400 group-hover:text-primary transition-colors">Sign up for Institutional Insights</span>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-secondary hover:shadow-secondary/30 transition-all transform active:scale-95 flex items-center justify-center space-x-4 shrink-0"
                                    >
                                        <span>{isSubmitting ? 'Processing' : 'Send Inquiry'}</span>
                                        <HiArrowRight className="text-xl" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InquiryForm;
