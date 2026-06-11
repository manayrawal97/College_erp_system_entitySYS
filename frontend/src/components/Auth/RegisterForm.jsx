import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Phone, GraduationCap, Briefcase, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateEmail, validatePhone, validatePassword } from '../../utils/validators';
import PasswordInput from './PasswordInput';
import { motion, AnimatePresence } from 'framer-motion';

const roles = [
  { id: 'student', title: 'Student', icon: GraduationCap, description: 'Access courses, grades & fees' },
  { id: 'faculty', title: 'Faculty', icon: Briefcase, description: 'Manage classes, attendance & grades' },
  { id: 'admin', title: 'Administrator', icon: User, description: 'Manage system, users & reports' },
];

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (values) => {
    const errors = {};
    if (step === 2) {
      if (!values.full_name) errors.full_name = 'Full name is required';
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!validateEmail(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.phone) {
        errors.phone = 'Phone is required';
      } else if (!validatePhone(values.phone)) {
        errors.phone = 'Invalid 10-digit phone number';
      }
    }
    if (step === 3 && values.role !== 'admin') {
      if (!values.department) errors.department = 'Department is required';
      if (values.role === 'student' && !values.current_semester) errors.current_semester = 'Semester is required';
      if (values.role === 'faculty' && !values.sub_role) errors.sub_role = 'Role is required';
    }
    if (step === 4) {
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (!validatePassword(values.password)) {
        errors.password = 'Must be 8+ chars with uppercase, lowercase & number';
      }
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, setValues, isValid } = useFormValidation(
    { 
      role: '', 
      full_name: '', 
      email: '', 
      phone: '', 
      department: '', 
      current_semester: '', 
      sub_role: '', 
      password: '', 
      confirmPassword: '' 
    },
    validate
  );

  const nextStep = () => {
    if (step === 1 && !values.role) return;
    if (step === 2 && (errors.full_name || errors.email || errors.phone)) return;
    if (step === 3 && values.role !== 'admin' && (errors.department || errors.current_semester || errors.sub_role)) return;
    
    if (step === 1 && values.role === 'admin') {
      setStep(2); // Skip step 3 for admin
    } else if (step === 2 && values.role === 'admin') {
      setStep(4); // Skip step 3 for admin
    } else {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step === 4 && values.role === 'admin') {
      setStep(2);
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    setIsLoading(true);
    try {
      const user = await register(values);
      
      // Role-based redirection
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      // Handled by context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl p-8 glass dark:glass-dark rounded-3xl shadow-2xl"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
        <div className="mt-4 flex justify-center items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={`h-2 w-8 rounded-full transition-all duration-300 ${
                step >= i ? 'bg-secondary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-4"
            >
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">Choose your role to get started</p>
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setValues({ ...values, role: r.id })}
                  className={`flex items-start gap-4 p-4 border-2 rounded-2xl transition-all ${
                    values.role === r.id 
                      ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20' 
                      : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${values.role === r.id ? 'bg-secondary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    <r.icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 dark:text-white">{r.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{r.description}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-200">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={values.full_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy/50 dark:text-white"
                  />
                </div>
                {touched.full_name && errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-200">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy/50 dark:text-white"
                  />
                </div>
                {touched.email && errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-200">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="1234567890"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy/50 dark:text-white"
                  />
                </div>
                {touched.phone && errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-200">Department</label>
                <select
                  name="department"
                  value={values.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy/50 dark:text-white"
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="EC">Electronics & Comm.</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
                {touched.department && errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
              </div>

              {values.role === 'student' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-200">Current Semester</label>
                  <select
                    name="current_semester"
                    value={values.current_semester}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy/50 dark:text-white"
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                  {touched.current_semester && errors.current_semester && <p className="text-xs text-red-500">{errors.current_semester}</p>}
                </div>
              )}

              {values.role === 'faculty' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-200">Sub-Role</label>
                  <select
                    name="sub_role"
                    value={values.sub_role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy/50 dark:text-white"
                  >
                    <option value="">Select Role</option>
                    <option value="Professor">Professor</option>
                    <option value="Asst. Professor">Asst. Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Lab Assistant">Lab Assistant</option>
                  </select>
                  {touched.sub_role && errors.sub_role && <p className="text-xs text-red-500">{errors.sub_role}</p>}
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <PasswordInput
                label="Create Password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
                showStrength
              />
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={step === 1 && !values.role}
              className="flex-[2] btn-premium bg-gradient-premium text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Continue
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] btn-premium bg-gradient-premium text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Creating Account...
                </>
              ) : (
                'Finish Registration'
              )}
            </button>
          )}
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-secondary hover:text-accent transition-colors">
          Sign In
        </Link>
      </p>
    </motion.div>
  );
};

export default RegisterForm;
