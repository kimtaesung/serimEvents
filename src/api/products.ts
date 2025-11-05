import { Product } from "../types/product";

// API 베이스 URL (환경 변수로 설정 권장)
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// API에서 반환되는 데이터 타입
interface ProductAPI {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  features: string[];
  isActive: boolean;
  display_order: number;
}

// API 데이터를 앱 형식으로 변환
function mapProductFromAPI(apiProduct: ProductAPI): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description,
    price: apiProduct.price,
    image: apiProduct.image,
    category: apiProduct.category,
    features: apiProduct.features,
    isActive: apiProduct.isActive,
  };
}

// 앱 데이터를 API 형식으로 변환
function mapProductToAPI(product: Partial<Product>): Partial<ProductAPI> {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    features: product.features,
    isActive: product.isActive,
  };
}

// 모든 상품 조회
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ProductAPI[] = await response.json();
    return data.map(mapProductFromAPI);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
}

// 단일 상품 조회
export async function getProduct(id: number): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ProductAPI = await response.json();
    return mapProductFromAPI(data);
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    throw error;
  }
}

// 상품 생성
export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mapProductToAPI(product)),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ProductAPI = await response.json();
    return mapProductFromAPI(data);
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
}

// 상품 수정
export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mapProductToAPI(product)),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ProductAPI = await response.json();
    return mapProductFromAPI(data);
  } catch (error) {
    console.error(`Failed to update product ${id}:`, error);
    throw error;
  }
}

// 상품 삭제
export async function deleteProduct(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    throw error;
  }
}

// 카테고리별 상품 조회
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(category)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ProductAPI[] = await response.json();
    return data.map(mapProductFromAPI);
  } catch (error) {
    console.error(`Failed to fetch products by category ${category}:`, error);
    throw error;
  }
}

// 재고 상태별 상품 조회
export async function getProductsByStock(inStock: boolean): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products?in_stock=${inStock}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ProductAPI[] = await response.json();
    return data.map(mapProductFromAPI);
  } catch (error) {
    console.error(`Failed to fetch products by stock status:`, error);
    throw error;
  }
}
