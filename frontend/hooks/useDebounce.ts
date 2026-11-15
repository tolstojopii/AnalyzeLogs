import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number) {
  const [input, setInput] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInput(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return input
}
