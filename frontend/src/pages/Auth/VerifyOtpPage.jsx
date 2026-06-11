import AuthLayout from '../../components/Auth/AuthLayout';
import VerifyOtpForm from '../../components/Auth/VerifyOtpForm';

const VerifyOtpPage = () => {
  return (
    <AuthLayout
      title="Identity Verification"
      subtitle="To keep your account secure, we've sent a verification code to your email."
      illustration="https://illustrations.popsy.co/white/shaking-hands.svg"
    >
      <VerifyOtpForm />
    </AuthLayout>
  );
};

export default VerifyOtpPage;
