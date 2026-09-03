import AuthLayout from '../../components/Auth/AuthLayout';
import RegisterForm from '../../components/Auth/RegisterForm';
import AuthIllustration from '../../components/Auth/AuthIllustration';

const RegisterPage = () => {
    return (
        <AuthLayout
            title="Start Your Academic Journey"
            subtitle="Create your account to access the next-generation University ERP system."
            illustration={<AuthIllustration type="register" />}
        >
            <RegisterForm />
        </AuthLayout>
    );
};

export default RegisterPage;
