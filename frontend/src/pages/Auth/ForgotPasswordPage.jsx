import AuthLayout from '../../components/Auth/AuthLayout';
import ForgotPasswordForm from '../../components/Auth/ForgotPasswordForm';

const ForgotPasswordPage = () => {
    return (
        <AuthLayout
            title="No Worries, We've Got You Covered"
            subtitle="Recover your account in a few simple steps and get back to your dashboard."
            illustration="https://illustrations.popsy.co/white/falling.svg"
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
