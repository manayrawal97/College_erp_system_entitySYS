import AuthLayout from '../../components/Auth/AuthLayout';
import RegisterForm from '../../components/Auth/RegisterForm';

const RegisterPage = () => {
  return (
    <AuthLayout
      title="Start Your Academic Journey"
      subtitle="Create your account to access the next-generation University ERP system."
      illustration="https://illustrations.popsy.co/white/startup-launch.svg"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
