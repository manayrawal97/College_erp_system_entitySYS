import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { getPasswordStrength } from '../../utils/validators';

const PasswordInput = ({ 
 label, 
 name, 
 value, 
 onChange, 
 onBlur, 
 error, 
 touched, 
 placeholder ="••••••••",
 showStrength = false 
}) => {
 const [showPassword, setShowPassword] = useState(false);
 const strength = getPasswordStrength(value);

 const getStrengthColor = () => {
 if (strength <= 2) return 'bg-red-500';
 if (strength <= 3) return 'bg-yellow-500';
 if (strength <= 4) return 'bg-blue-500';
 return 'bg-green-500';
 };

 const getStrengthText = () => {
 if (strength === 0) return '';
 if (strength <= 2) return 'Weak';
 if (strength <= 3) return 'Fair';
 if (strength <= 4) return 'Good';
 return 'Strong';
 };

 return (
 <div className="space-y-2">
 <label className="block text-sm font-medium text-gray-700">
 {label}
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Lock className="h-5 w-5 text-gray-400" />
 </div>
 <input
 type={showPassword ?"text" :"password"}
 name={name}
 value={value}
 onChange={onChange}
 onBlur={onBlur}
 placeholder={placeholder}
 className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
 touched && error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 '
 }`}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
 >
 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
 </button>
 </div>
 
 {touched && error && (
 <p className="text-xs text-red-500 mt-1">{error}</p>
 )}

 {showStrength && value.length > 0 && (
 <div className="mt-2 space-y-1">
 <div className="flex justify-between items-center text-xs">
 <span className="text-gray-500">Password Strength:</span>
 <span className={`font-semibold ${getStrengthColor().replace('bg-', 'text-')}`}>
 {getStrengthText()}
 </span>
 </div>
 <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
 <div 
 className={`h-full transition-all duration-500 ${getStrengthColor()}`}
 style={{ width: `${(strength / 5) * 100}%` }}
 />
 </div>
 </div>
 )}
 </div>
 );
};

export default PasswordInput;
