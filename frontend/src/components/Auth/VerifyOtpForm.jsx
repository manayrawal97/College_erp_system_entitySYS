import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { authApi } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const VerifyOtpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please try again.');
      navigate('/login');
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto submit if complete
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData('text').substring(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    if (data.length === 6) {
      handleVerify(data);
    } else {
      inputRefs.current[data.length].focus();
    }
  };

  const handleVerify = async (otpValue) => {
    setIsLoading(true);
    try {
      await authApi.verifyOtp({ email, otp: otpValue });
      toast.success('Verification successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md p-8 glass dark:glass-dark rounded-3xl shadow-2xl text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 mb-6">
        <ShieldCheck className="h-10 w-10 text-secondary" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Verify OTP</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        We've sent a 6-digit code to <br />
        <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
      </p>

      <div className="mt-8 flex justify-between gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all dark:text-white"
          />
        ))}
      </div>

      <button
        onClick={() => handleVerify(otp.join(''))}
        disabled={isLoading || otp.some(d => d === '')}
        className="mt-8 w-full btn-premium bg-gradient-premium text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            Verifying...
          </>
        ) : (
          'Verify & Proceed'
        )}
      </button>

      <div className="mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Didn't receive the code?{' '}
          <button 
            onClick={() => {/* Resend logic */}}
            className="text-secondary font-semibold hover:underline"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default VerifyOtpForm;
