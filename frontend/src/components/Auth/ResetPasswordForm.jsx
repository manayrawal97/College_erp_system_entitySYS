import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import { authApi } from '../../services/api';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validatePassword } from '../../utils/validators';
import PasswordInput from './PasswordInput';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (values) => {
    const errors = {};
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(values.password)) {
      errors.password = 'Must be 8+ chars with uppercase, lowercase & number';
    }
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, isValid } = useFormValidation(
    { password: '', confirmPassword: '' },
    validate
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid() || !token) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, password: values.password });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-8 glass dark:glass-dark rounded-3xl">
        <h2 className="text-2xl font-bold text-red-500">Invalid Link</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">The password reset link is invalid or has expired.</p>
        <button onClick={() => navigate('/forgot-password')} className="mt-4 text-secondary font-medium">Request a new link</button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 glass dark:glass-dark rounded-3xl shadow-2xl text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Password Reset!</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Your password has been reset successfully. Redirecting you to login...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 glass dark:glass-dark rounded-3xl shadow-2xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please enter your new password below.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <PasswordInput
          label="New Password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
          showStrength
        />

        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-premium bg-gradient-premium text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ResetPasswordForm;
