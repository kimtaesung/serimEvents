import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Trash2 } from "lucide-react";
import "./tabs.css";

interface Product {
  id: number;
  category_id?: number;
  product_name: string;
  description?: string;
  price?: number | null;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  features?: any[];
}

interface Category {
  id: number;
  category_index: number;
  category_name: string;
}

// 로컬 스토리지에서 상품 불러오기
const loadProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem('products');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load products from localStorage:', error);
  }
  return [];
};

// 로컬 스토리지에서 카테고리 불러오기
const loadCategories = (): Category[] => {
  try {
    const stored = localStorage.getItem('categories');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load categories from localStorage:', error);
  }
  return [];
};

export function ProductTab() {
  const [products, setProducts] = useState<Product[]>(loadProducts());
  const [categories, setCategories] = useState<Category[]>(loadCategories());
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    productName: "",
    description: "",
    price: "",
    imageUrl: "",
    features: [] as string[],
  });
  const [featureInput, setFeatureInput] = useState("");
  const [message, setMessage] = useState("");

  // 상품 및 카테고리 목록 조회
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setMessage("데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        categoryId: product.category_id?.toString() || "",
        productName: product.product_name,
        description: product.description || "",
        price: product.price?.toString() || "",
        imageUrl: product.image_url || "",
        features: product.features || [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        categoryId: "",
        productName: "",
        description: "",
        price: "",
        imageUrl: "",
        features: [],
      });
    }
    setFeatureInput("");
    setIsDialogOpen(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput],
      }));
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.productName) {
        setMessage("상품명을 입력하세요");
        return;
      }

      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : "/api/products";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          productName: formData.productName,
          description: formData.description || null,
          price: formData.price ? parseFloat(formData.price) : null,
          imageUrl: formData.imageUrl || null,
          features: formData.features.length > 0 ? formData.features : null,
        }),
      });

      if (response.ok) {
        setMessage(editingProduct ? "상품이 수정되었습니다" : "상품이 추가되었습니다");
        await fetchData();
        setIsDialogOpen(false);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      setMessage("상품 저장 실패");
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (response.ok) {
        setMessage("상품이 삭제되었습니다");
        await fetchData();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      setMessage("상품 삭제 실패");
    }
  };

  if (loading) {
    return <div className="tab-content">로드 중...</div>;
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>상품정보 관리</h2>
        <p>상품 정보를 관리합니다. 가격은 선택사항입니다.</p>
      </div>

      <Button 
        onClick={() => handleOpenDialog()}
        className="add-button"
      >
        + 상품 추가
      </Button>

      {message && <div className="form-message">{message}</div>}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>상품명</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>설명</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">상품이 없습니다</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id}>
                  <td className="product-name">{product.product_name}</td>
                  <td>
                    {product.category_id
                      ? categories.find(c => c.id === product.category_id)?.category_name || "-"
                      : "-"}
                  </td>
                  <td>{product.price ?? "-"}</td>
                  <td className="truncate">{product.description || "-"}</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => handleOpenDialog(product)}
                      className="edit-btn"
                      title="수정"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="delete-btn"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 상품 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "상품 수정" : "상품 추가"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="form-group">
              <Label htmlFor="categoryId">카테고리 (선택)</Label>
              <select
                id="categoryId"
                title="카테고리 선택"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">선택하지 않음</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <Label htmlFor="productName">상품명 *</Label>
              <Input
                id="productName"
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="상품명 입력"
              />
            </div>

            <div className="form-group">
              <Label htmlFor="price">가격 (선택)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="가격 (입력하지 않으면 null)"
              />
            </div>

            <div className="form-group">
              <Label htmlFor="imageUrl">이미지 URL</Label>
              <Input
                id="imageUrl"
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="이미지 URL"
              />
            </div>

            <div className="form-group">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="상품 설명"
                rows={3}
              />
            </div>

            <div className="form-group">
              <Label htmlFor="featureInput">기능/특징</Label>
              <div className="flex gap-2">
                <Input
                  id="featureInput"
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                  placeholder="기능 입력 후 Enter"
                />
                <Button onClick={handleAddFeature}>추가</Button>
              </div>
              {formData.features.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>{feature}</span>
                      <button
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-500 hover:text-red-700"
                        title="삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              {editingProduct ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
