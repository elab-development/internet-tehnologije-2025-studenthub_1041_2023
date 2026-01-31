import { useCallback } from 'react';

function useScrollToTop() {
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return scrollToTop;
}

export default useScrollToTop;
