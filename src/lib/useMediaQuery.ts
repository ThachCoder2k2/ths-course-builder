import { useEffect, useState } from 'react';

/**
 * Theo dõi một media query. Dùng khi cách trình bày phải đổi hẳn theo khổ màn, chứ không
 * chỉ đổi kích thước — thứ mà class responsive của CSS không làm thay được.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false));

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
