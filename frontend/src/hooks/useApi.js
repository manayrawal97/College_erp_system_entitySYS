import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useApi — wraps any async API function with loading/error/data state.
 *
 * @param {Function} apiFn      — the service function to call (e.g. coursesService.getAll)
 * @param {Object}   options
 *   @param {boolean} immediate — auto-execute on mount (default: true)
 *   @param {Array}   deps      — re-execute when these change (only used with immediate)
 *
 * Returns: { data, loading, error, execute, setData }
 */
export function useApi(apiFn, { immediate = true, deps = [] } = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error,   setError]   = useState(null);

  // Track whether the component is still mounted before setting state
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
        // API responses nest data under res.data.data or res.data
        const payload = res.data?.data ?? res.data;
        setData(payload);
        return res.data; // return full response for callers who need pagination etc.
      }
    } catch (err) {
      if (mountedRef.current) {
        const msg = err.response?.data?.message || err.message || 'Request failed';
        setError(msg);
        throw err; // re-throw so callers can catch + toast
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-execute on mount / when deps change
  useEffect(() => {
    if (immediate) execute();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, execute, setData };
}

export default useApi;