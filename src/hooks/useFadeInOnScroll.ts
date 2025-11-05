import { useEffect, useRef } from 'react';

/**
 * Intersection Observer를 사용하여 요소가 뷰포트에 들어올 때 페이드인 효과를 적용하는 훅
 */
export function useFadeInOnScroll(options = {}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 요소가 뷰포트에 들어오면 'fade-in' 클래스 추가
          entry.target.classList.add('fade-in');
          // 한 번만 트리거되도록 관찰 중단
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1, // 요소의 10%가 보일 때 트리거
      ...options, // 추가 옵션 병합
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return ref;
}
