import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues, validate) => {
 const [values, setValues] = useState(initialValues);
 const [errors, setErrors] = useState({});
 const [touched, setTouched] = useState({});

 const handleChange = useCallback((e) => {
 const { name, value, type, checked } = e.target;
 const val = type === 'checkbox' ? checked : value;
 
 setValues((prev) => ({ ...prev, [name]: val }));
 
 if (validate) {
 const validationErrors = validate({ ...values, [name]: val });
 setErrors(validationErrors);
 }
 }, [values, validate]);

 const handleBlur = useCallback((e) => {
 const { name } = e.target;
 setTouched((prev) => ({ ...prev, [name]: true }));
 
 if (validate) {
 const validationErrors = validate(values);
 setErrors(validationErrors);
 }
 }, [values, validate]);

 const isValid = useCallback(() => {
 if (!validate) return true;
 const validationErrors = validate(values);
 return Object.keys(validationErrors).length === 0;
 }, [values, validate]);

 return {
 values,
 errors,
 touched,
 handleChange,
 handleBlur,
 setValues,
 setErrors,
 isValid,
 };
};
