import AuthLayout from '../../components/Auth/AuthLayout';
import LoginForm from '../../components/Auth/LoginForm';

const LoginPage = () => {
 return (
 <AuthLayout
 title="Empowering Education Through Technology"
 subtitle="Join thousands of students and faculty managing their academic journey with EntitySYS."
 illustration="https://illustrations.popsy.co/white/student-going-to-school.svg"
 >
 <LoginForm />
 </AuthLayout>
 );
};

export default LoginPage;
