import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const VerifyOtpForm = ({ email, onNext }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }

        // Auto-submit if all digits are entered
        if (newOtp.every(digit => digit !== '') && value) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async (code) => {
        setLoading(true);
        try {
            const response = await authApi.verifyOTP(email, code);
            if (response.data.success) {
                toast.success('OTP Verified Successfully');
                onNext(response.data.resetToken);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setLoading(true);
        try {
            await authApi.forgotPassword(email);
            toast.success('New OTP sent');
            setTimer(60);
        } catch (error) {
            toast.error('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 p-8 glass rounded-3xl shadow-2xl"
        >
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Verify Identity</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Enter the code sent to {email}
                </p>
            </div>

            <div className="mt-8 space-y-6">
                <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={el => inputRefs.current[idx] = el}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className="w-12 h-14 border border-gray-300 rounded-xl text-center text-xl font-bold focus:ring-2 focus:ring-secondary focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                        />
                    ))}
                </div>

                <button
                    onClick={() => handleVerify(otp.join(''))}
                    disabled={loading || otp.some(d => !d)}
                    className="w-full btn-premium bg-gradient-premium text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5" />
                            Verifying...
                        </>
                    ) : (
                        'Verify OTP'
                    )}
                </button>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Didn't receive code? {timer > 0 ? (
                            <span className="text-secondary font-medium">Resend in {timer}s</span>
                        ) : (
                            <button onClick={handleResend} className="text-secondary font-bold hover:text-accent transition-colors">Resend OTP</button>
                        )}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default VerifyOtpForm;
