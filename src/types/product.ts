export interface Product {
  id: number;
  name: string;
  description: string;
  price?: number;
  image: string;                    // 메인 이미지
  images?: string[];                // 여러 이미지 (갤러리용)
  category: string;
  features: string[];
  isActive?: boolean;               // 표시 여부 (true: 표시, false: 표시안함)
  order?: number;
  display_order?: number;
}
