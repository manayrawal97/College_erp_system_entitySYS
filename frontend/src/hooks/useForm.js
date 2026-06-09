import { useState, useCallback } from 'react';

/**
 * useForm — lightweight controlled-form manager.
 *
 * @param {Object} initialValues       — shape of the form
 * @param {Object} validationRules     — { fieldName: [ruleFn, ...] }
 *   Each ruleFn(value, allValues) returns an error string or empty string.
 *
 * Returns: { values, errors, touched, handleChange, handleBlur, setValue, reset, isValid, setErrors }
 */
export function useForm(initialValues = {}, validationRules = {}) {
  const [values,  setValues]  = useState(initialValues);
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((vals = values) => {
    const newErrors = {};
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = vals[field];
      for (const rule of rules) {
        const error = rule(value, vals);
        if (error) { newErrors[field] = error; break; }
      }
    });
    return newErrors;
  }, [values, validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setValues(prev => ({ ...prev, [name]: newValue }));
    // Clear error as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    // Validate on blur
    const fieldRules = validationRules[name];
    if (fieldRules) {
      for (const rule of fieldRules) {
        const error = rule(values[name], values);
        if (error) { setErrors(prev => ({ ...prev, [name]: error })); break; }
        else        { setErrors(prev => ({ ...prev, [name]: '' })); }
      }
    }
  }, [values, validationRules]);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /** Run full validation, mark all fields touched, return true if valid */
  const isValid = useCallback(() => {
    const errs = validate();
    setErrors(errs);
    // Touch all validated fields so errors show up
    const allTouched = Object.keys(validationRules).reduce(
      (acc, k) => ({ ...acc, [k]: true }), {}
    );
    setTouched(allTouched);
    return Object.keys(errs).length === 0;
  }, [validate, validationRules]);

  return {
    values, errors, touched,
    handleChange, handleBlur,
    setValue, setValues, setErrors,
    reset, isValid,
  };
}

// ── Reusable validation rule factories ────────────────────────
export const rules = {
  required:  (msg = 'This field is required') =>
    (v) => (!v && v !== 0) || (typeof v === 'string' && !v.trim()) ? msg : '',

  email: (msg = 'Enter a valid email address') =>
    (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? msg : '',

  minLength: (n, msg) =>
    (v) => v && v.length < n ? (msg || `Minimum ${n} characters required`) : '',

  maxLength: (n, msg) =>
    (v) => v && v.length > n ? (msg || `Maximum ${n} characters allowed`) : '',

  password: (msg = 'Password needs 8+ chars with uppercase, lowercase and number') =>
    (v) => v && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v) ? msg : '',

  match: (field, msg = 'Fields do not match') =>
    (v, all) => v !== all[field] ? msg : '',

  min: (n, msg) =>
    (v) => v !== '' && v !== undefined && Number(v) < n ? (msg || `Minimum value is ${n}`) : '',

  max: (n, msg) =>
    (v) => v !== '' && v !== undefined && Number(v) > n ? (msg || `Maximum value is ${n}`) : '',

  pattern: (regex, msg = 'Invalid format') =>
    (v) => v && !regex.test(v) ? msg : '',
};

export default useForm;