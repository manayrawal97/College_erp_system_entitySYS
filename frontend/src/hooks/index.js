import { useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

// ── useApi: generic data fetcher with loading/error state ─────

export function useApi(apiFn, { immediate = true, deps = [] } = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFn(...args);
            if (mountedRef.current) {
                setData(res.data.data ?? res.data);
                return res.data;
            }
        } catch (err) {
            if (mountedRef.current) {
                const msg = err.response?.data?.message || err.message || 'Request failed';
                setError(msg);
                throw err;
            }
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []); // eslint-disable-line

    useEffect(() => {
        if (immediate) execute();
    }, deps); // eslint-disable-line

    return { data, loading, error, execute, setData };
}

// ── useForm: form state + validation ─────────────────────────
export function useForm(initialValues, validationRules = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
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
        setValues(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        // Clear error on change
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }, [errors]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    const setValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    }, []);

    const reset = useCallback((newValues = initialValues) => {
        setValues(newValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    const isValid = useCallback(() => {
        const errs = validate();
        setErrors(errs);
        const allTouched = Object.keys(validationRules).reduce((acc, k) => ({ ...acc, [k]: true }), {});
        setTouched(allTouched);
        return Object.keys(errs).length === 0;
    }, [validate, validationRules]);

    return {
        values, errors, touched,
        handleChange, handleBlur, setValue, reset, isValid,
        setErrors, setValues,
    };
}

// Validation rule helpers
export const rules = {
    required: (msg = 'This field is required') =>
        (v) => (!v && v !== 0) || (typeof v === 'string' && !v.trim()) ? msg : '',
    email: (msg = 'Enter a valid email') =>
        (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? msg : '',
    minLength: (n, msg) =>
        (v) => v && v.length < n ? (msg || `Minimum ${n} characters`) : '',
    maxLength: (n, msg) =>
        (v) => v && v.length > n ? (msg || `Maximum ${n} characters`) : '',
    password: () =>
        (v) => v && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v)
            ? 'Password needs 8+ chars, uppercase, lowercase & number' : '',
    match: (field, msg = 'Fields do not match') =>
        (v, allValues) => v !== allValues[field] ? msg : '',
    min: (n, msg) => (v) => v !== '' && Number(v) < n ? (msg || `Minimum value: ${n}`) : '',
    max: (n, msg) => (v) => v !== '' && Number(v) > n ? (msg || `Maximum value: ${n}`) : '',
};

// ── usePagination ──────────────────────────────────────────────
export function usePagination(initialPage = 1, initialLimit = 20) {
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [total, setTotal] = useState(0);

    const totalPages = Math.ceil(total / limit);
    const canPrev = page > 1;
    const canNext = page < totalPages;

    return {
        page, limit, total, totalPages, canPrev, canNext,
        setPage, setLimit, setTotal,
        nextPage: () => canNext && setPage(p => p + 1),
        prevPage: () => canPrev && setPage(p => p - 1),
    };
}

// ── useConfirm: simple promise-based confirm ──────────────────
export function useConfirm() {
    const confirm = (message) => {
        return new Promise((resolve) => {
            // Using window.confirm as a simple solution;
            // Replace with modal in production for better UX
            resolve(window.confirm(message));
        });
    };
    return { confirm };
}

// ── useDebounce ────────────────────────────────────────────────
export function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ── useLocalStorage ────────────────────────────────────────────
export function useLocalStorage(key, initialValue) {
    const [stored, setStored] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch { return initialValue; }
    });

    const setValue = (value) => {
        try {
            setStored(value);
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) { console.error(err); }
    };

    return [stored, setValue];
}

// ── useAsync: fire-and-forget with toast ──────────────────────
export function useAsync() {
    const [loading, setLoading] = useState(false);

    const run = useCallback(async (fn, { successMsg, errorMsg } = {}) => {
        setLoading(true);
        try {
            const result = await fn();
            if (successMsg) toast.success(successMsg);
            return result;
        } catch (err) {
            const msg = errorMsg || err.response?.data?.message || err.message || 'Action failed';
            toast.error(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, run };
}