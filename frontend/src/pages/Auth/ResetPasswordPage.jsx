import AuthLayout from '../../components/Auth/AuthLayout';
import ResetPasswordForm from '../../components/Auth/ResetPasswordForm';
import AuthIllustration from '../../components/Auth/AuthIllustration';

const ResetPasswordPage = () => {
    return (
        <AuthLayout
            title="Secure Your Account"
            subtitle="Choose a strong password to ensure your data remains safe and protected."
            illustration={<AuthIllustration type="reset" />}
        >
            <ResetPasswordForm />
        </AuthLayout>
    );
};

export default ResetPasswordPage;
