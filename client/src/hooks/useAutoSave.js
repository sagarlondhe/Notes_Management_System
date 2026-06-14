import { useEffect, useRef } from 'react';

/**
 * Hook to auto-save data when values change (debounced).
 * @param {Object} value - The form state or values to monitor
 * @param {Function} saveCallback - The function to call when auto-saving
 * @param {number} delay - Debounce delay in ms (default 1500ms)
 * @param {boolean} skip - Condition to skip triggering save (e.g. during initial load or loading state)
 */
export function useAutoSave(value, saveCallback, delay = 1500, skip = false) {
  const saveCallbackRef = useRef(saveCallback);
  const isInitial = useRef(true);

  useEffect(() => {
    saveCallbackRef.current = saveCallback;
  }, [saveCallback]);

  useEffect(() => {
    // Reset initial run check on skip changes
    if (skip) {
      isInitial.current = true;
      return;
    }

    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    const timer = setTimeout(() => {
      saveCallbackRef.current(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, skip]);
}
export default useAutoSave;
