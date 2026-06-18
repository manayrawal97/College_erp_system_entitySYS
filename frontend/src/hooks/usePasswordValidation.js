import { useState, useEffect } from 'react';

export const usePasswordValidation = (password, confirmPassword = '') => {
    const [validations, setValidations] = useState({
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
        match: false
    });

    const [strength, setStrength] = useState(0);

    useEffect(() => {
        const checks = {
            minLength: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*]/.test(password),
            match: confirmPassword ? password === confirmPassword : true
        };

        setValidations(checks);

        // Calculate strength (0 to 5)
        const metCount = Object.values(checks).filter((v, i) => i < 5 && v).length;
        setStrength(metCount);

    }, [password, confirmPassword]);

    const getStrengthLabel = () => {
        if (strength <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
        if (strength <= 4) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500' };
        if (strength === 5) return { label: 'Strong', color: 'bg-blue-500', text: 'text-blue-500' };
        return { label: 'Weak', color: 'bg-gray-200', text: 'text-gray-400' };
    };

    return { validations, strength, getStrengthLabel };
};
