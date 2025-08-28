import { useEffect, useRef } from 'react';

export function useAutoScroll<T extends HTMLElement>(dep: any): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);

  return ref;
}