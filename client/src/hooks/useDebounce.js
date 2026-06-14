import { useState, useEffect } from 'react';

/**
 * Hook to debounce value updates.
 * @param {*} value 
 * @param {number} delay (ms)
 * @returns {*}
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
