import { Card } from './ui/card';
import './EventsPage.css';
import InquirySample from './InquirySample';
import { useRef, useEffect } from 'react';

// 동적으로 이미지 import
const eventImages = Array.from({ length: 17 }, (_, i) => {
  const imageNum = i + 1;
  return {
    id: imageNum,
    src: new URL(`../assets/events/${imageNum}.png`, import.meta.url).href,
    alt: `Event ${imageNum}`,
  };
});

export function EventsPage() {
  const inquiryRef = useRef<HTMLDivElement>(null);
  const drawerButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToInquiry = () => {
    if (inquiryRef.current) { 
      // 컨테이너의 맨 하단으로 스크롤
      const container = inquiryRef.current.closest('.events-page-container') as HTMLElement;
      if (container) {
        // 마지막 카드의 위치로 스크롤
        const lastCard = container.querySelector('.events-image-card:last-child') as HTMLElement;
        if (lastCard) {
          lastCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // 추가 스크롤: 페이지 끝까지 더 내리기
          setTimeout(() => {
            const scrollHeight = document.documentElement.scrollHeight;
            window.scrollBy({ top: scrollHeight, behavior: 'smooth' });
          }, 500);
        }
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // 현재 스크롤 위치 + 윈도우 높이가 거의 페이지 끝에 도달했는지 확인
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      
      // 페이지 끝에서 100px 이내일 때 숨김
      const atBottom = scrollPosition >= pageHeight - 100;

      if (drawerButtonRef.current) {
        if (atBottom) {
          drawerButtonRef.current.style.opacity = '0';
          drawerButtonRef.current.style.pointerEvents = 'none';
        } else {
          drawerButtonRef.current.style.opacity = '1';
          drawerButtonRef.current.style.pointerEvents = 'auto';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="events-page-container">
      <div className="events-page-content">
        {eventImages.map((image, index) => (
          <Card key={image.id} className="events-image-card !bg-transparent !border-none">
            {index === 16 ? (
              <div ref={inquiryRef}>
                <InquirySample />
              </div>
            ) : (
              <img
                src={image.src}
                alt={image.alt}
                className="events-image"
                loading="lazy"
              />
            )}
          </Card>
        ))}
      </div>
      <div className="inquiry-form-backdrop"></div>
      {/* Floating Drawer Button */}
      <button
        ref={drawerButtonRef}
        onClick={scrollToInquiry}
        className="inquiry-drawer-button"
        title="문의하기"
      >
        <span className="drawer-button-text">문의하기</span>
        <span className="drawer-button-arrow">↓</span>
      </button>
    </div>
  );
}
