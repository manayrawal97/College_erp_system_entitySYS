import AuthLayout from '../../components/Auth/AuthLayout';
import LoginForm from '../../components/Auth/LoginForm';
import AuthIllustration from '../../components/Auth/AuthIllustration';

const LoginPage = () => {
    return (
        <AuthLayout
            title="Empowering Education Through Technology"
            subtitle="Join thousands of students and faculty managing their academic journey with EntitySYS."
            illustration={<AuthIllustration type="login" />}
        >
            <LoginForm />
        </AuthLayout>
    );
};

export default LoginPage;
