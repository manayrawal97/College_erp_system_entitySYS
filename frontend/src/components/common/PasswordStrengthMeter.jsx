import React from 'react';
import { Check, X } from 'lucide-react';
import { usePasswordValidation } from '../../hooks/usePasswordValidation';

const PasswordStrengthMeter = ({ password, confirmPassword }) => {
    const { validations, strength, getStrengthLabel } = usePasswordValidation(password, confirmPassword);
    const config = getStrengthLabel();

    const requirements = [
        { key: 'minLength', label: 'At least 8 characters' },
        { key: 'hasUpper', label: 'At least one uppercase [A-Z]' },
        { key: 'hasLower', label: 'At least one lowercase [a-z]' },
        { key: 'hasNumber', label: 'At least one number [0-9]' },
        { key: 'hasSpecial', label: 'At least one special char [!@#$%^&*]' },
        { key: 'match', label: 'Passwords match', alwaysShow: !!confirmPassword }
    ];

    return (
        <div className="mt-4 space-y-4">
            {/* Strength Bar */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Strength</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}>{config.label}</span>
                </div>
                <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                            key={level} 
                            className={`flex-1 rounded-full transition-all duration-500 ${level <= strength ? config.color : 'bg-gray-100'}`}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {requirements.map((req) => (
                    (req.alwaysShow || password.length > 0) && (
                        <div key={req.key} className="flex items-center gap-2">
                            <div className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${validations[req.key] ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                                {validations[req.key] ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
                            </div>
                            <span className={`text-[10px] font-bold ${validations[req.key] ? 'text-gray-700' : 'text-gray-400'}`}>
                                {req.label}
                            </span>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;
