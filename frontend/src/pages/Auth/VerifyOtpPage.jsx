import AuthLayout from '../../components/Auth/AuthLayout';
import VerifyOtpForm from '../../components/Auth/VerifyOtpForm';
import AuthIllustration from '../../components/Auth/AuthIllustration';

const VerifyOtpPage = () => {
    return (
        <AuthLayout
            title="Identity Verification"
            subtitle="To keep your account secure, we've sent a verification code to your email."
            illustration={<AuthIllustration type="verify" />}
        >
            <VerifyOtpForm />
        </AuthLayout>
    );
};

export default VerifyOtpPage;
