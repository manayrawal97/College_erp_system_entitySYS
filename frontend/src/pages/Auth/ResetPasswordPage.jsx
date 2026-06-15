import AuthLayout from '../../components/Auth/AuthLayout';
import ResetPasswordForm from '../../components/Auth/ResetPasswordForm';

const ResetPasswordPage = () => {
 return (
 <AuthLayout
 title="Secure Your Account"
 subtitle="Choose a strong password to ensure your data remains safe and protected."
 illustration="https://illustrations.popsy.co/white/key.svg"
 >
 <ResetPasswordForm />
 </AuthLayout>
 );
};

export default ResetPasswordPage;
