import React, { useState } from 'react';
import AuthLayout from '../../components/Auth/AuthLayout';
import ForgotPasswordForm from '../../components/Auth/ForgotPasswordForm';
import VerifyOtpForm from '../../components/Auth/VerifyOtpForm';
import ResetPasswordForm from '../../components/Auth/ResetPasswordForm';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');

    const handleEmailSubmitted = (email) => {
        setEmail(email);
        setStep(2);
    };

    const handleOtpVerified = (token) => {
        setResetToken(token);
        setStep(3);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <ForgotPasswordForm onNext={handleEmailSubmitted} />;
            case 2:
                return <VerifyOtpForm email={email} onNext={handleOtpVerified} />;
            case 3:
                return <ResetPasswordForm email={email} resetToken={resetToken} />;
            default:
                return <ForgotPasswordForm onNext={handleEmailSubmitted} />;
        }
    };

    return (
        <AuthLayout
            title={step === 1 ? "Forgot Your Password?" : step === 2 ? "Verify Your Identity" : "Create New Password"}
            subtitle={
                step === 1 ? "Don't worry, it happens to the best of us. Let's get you back in." :
                step === 2 ? "We've sent a 6-digit code to your inbox to ensure it's really you." :
                "Almost there! Choose a strong password to secure your account."
            }
            illustration={
                step === 1 ? "https://illustrations.popsy.co/white/falling.svg" :
                step === 2 ? "https://illustrations.popsy.co/white/key.svg" :
                "https://illustrations.popsy.co/white/lock.svg"
            }
        >
            {renderStep()}
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
