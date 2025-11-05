import { useState } from "react";
import { Product } from "../types/product";
import { toast } from "sonner";

export function useProductForm(
  products: Product[],
  onUpdateProducts: (products: Product[]) => void
) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: undefined,
    image: "",
    images: [],
    category: "",
    features: [],
    isActive: true,
  });
  const [featureInput, setFeatureInput] = useState("");

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: undefined,
      image: "",
      images: [],
      category: "",
      features: [],
      isActive: true,
    });
    setFeatureInput("");
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), featureInput.trim()],
      });
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: newFeatures,
    });
  };

  const handleSave = async () => {
    // 유효성 검사 - price는 선택사항
    if (!formData.name || !formData.description || !formData.category) {
      toast.error("상품명, 설명, 카테고리는 필수입니다.");
      return;
    }

    try {
      if (editingProduct) {
        // 수정: API 호출
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // 수정 성공 시 최신 상품 목록을 다시 가져오기
          const productsResponse = await fetch("/api/products");
          if (productsResponse.ok) {
            const updatedProducts = await productsResponse.json();
            onUpdateProducts(updatedProducts);
          }
          toast.success("상품이 수정되었습니다.");
        } else {
          toast.error("상품 수정에 실패했습니다.");
          return;
        }
      } else {
        // 추가: API 호출
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // 추가 성공 시 최신 상품 목록을 다시 가져오기
          const productsResponse = await fetch("/api/products");
          if (productsResponse.ok) {
            const updatedProducts = await productsResponse.json();
            onUpdateProducts(updatedProducts);
          }
          toast.success("상품이 추가되었습니다.");
        } else {
          const errorText = await response.text();
          console.error("POST 400 오류 - 요청 데이터:", formData);
          console.error("POST 400 오류 - 응답:", errorText);
          toast.error(`상품 추가에 실패했습니다: ${errorText}`);
          return;
        }
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const updatedProducts = products.filter((p) => p.id !== id);
          onUpdateProducts(updatedProducts);
          toast.success("상품이 삭제되었습니다.");
        } else {
          toast.error("상품 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("오류가 발생했습니다.");
      }
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingProduct,
    formData,
    setFormData,
    featureInput,
    setFeatureInput,
    handleOpenDialog,
    handleCloseDialog,
    handleAddFeature,
    handleRemoveFeature,
    handleSave,
    handleDelete,
  };
}
