import { Card } from './ui/card';
import './EventsPage.css';
import InquirySample from './InquirySample';
import { useRef, useEffect } from 'react';

// 이미지별 하단 문의 버튼 설정 (1~10번 이미지)
const CTA_BUTTON_CONFIG: Record<number, { label: string; type: 'pill' | 'ticket' }> = {
  1: { label: '도입문의', type: 'pill' },
  2: { label: '무료시연 문의', type: 'pill' },
  3: { label: '무료체험 문의', type: 'pill' },
  4: { label: '견적 문의', type: 'pill' },
  5: { label: '렌탈 문의', type: 'pill' },
  6: { label: '이벤트 바로가기', type: 'ticket' },
  7: { label: '이벤트 바로가기', type: 'ticket' },
  8: { label: '이벤트 바로가기', type: 'ticket' },
  9: { label: '이벤트 바로가기', type: 'ticket' },
  10: { label: '도입 문의', type: 'pill' },
};

// 동적으로 이미지 import
const eventImages = Array.from({ length: 17 }, (_, i) => {
  const imageNum = i + 1;
  return {
    id: imageNum,
    src: new URL(`../assets/events/${imageNum}.png`, import.meta.url).href,
    alt: `Event ${imageNum}`,
    cta: CTA_BUTTON_CONFIG[imageNum],
  };
});

export function EventsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inquiryRef = useRef<HTMLDivElement>(null);
  const drawerButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToInquiry = () => {
    if (inquiryRef.current) {
      inquiryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 300);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => {
      const scrollPosition = container
        ? container.scrollTop + container.clientHeight
        : window.scrollY + window.innerHeight;
      const pageHeight = container
        ? container.scrollHeight
        : document.documentElement.scrollHeight;

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

    container?.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);
    return () => {
      container?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="events-page-container">
      <div className="events-page-content">
        {eventImages.map((image, index) => (
          <Card key={image.id} className="events-image-card !bg-transparent !border-none">
            {index === 16 ? (
              <div ref={inquiryRef} id="inquiry-section">
                <InquirySample />
              </div>
            ) : (
              <div className="events-image-wrapper">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="events-image"
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
                {image.cta && (
                  <button
                    type="button"
                    onClick={scrollToInquiry}
                    className={`events-cta-hotspot ${
                      image.cta.type === 'ticket' ? 'events-cta-ticket' : 'events-cta-pill'
                    }`}
                    aria-label={image.cta.label}
                    title={`${image.cta.label} (하단 문의하기로 이동)`}
                  />
                )}
              </div>
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
