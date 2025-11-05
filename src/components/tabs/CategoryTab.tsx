import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Trash2 } from "lucide-react";
import "./tabs.css";

interface Category {
  id: number;
  category_index: number;
  category_name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

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

export function CategoryTab() {
  const [categories, setCategories] = useState<Category[]>(loadCategories());
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ categoryIndex: 0, categoryName: "", description: "" });
  const [message, setMessage] = useState("");

  // 카테고리 목록 조회
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          localStorage.setItem('categories', JSON.stringify(data));
          return;
        }
      } catch (apiError) {
        console.warn('API 로드 실패, 로컬 스토리지 사용:', apiError);
      }
      
      // 로컬 스토리지에서 불러오기
      const stored = localStorage.getItem('categories');
      if (stored) {
        setCategories(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setMessage("카테고리 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        categoryIndex: category.category_index,
        categoryName: category.category_name,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ categoryIndex: 0, categoryName: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.categoryName || formData.categoryIndex === undefined) {
        setMessage("카테고리명과 인덱스를 입력하세요");
        return;
      }

      let updatedCategories: Category[];
      
      if (editingCategory) {
        // 수정
        updatedCategories = categories.map(cat =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                category_index: formData.categoryIndex,
                category_name: formData.categoryName,
                description: formData.description || undefined,
              }
            : cat
        );
      } else {
        // 추가
        const newCategory: Category = {
          id: Math.max(...categories.map(c => c.id), 0) + 1,
          category_index: formData.categoryIndex,
          category_name: formData.categoryName,
          description: formData.description || undefined,
          display_order: 0,
          is_active: true,
        };
        updatedCategories = [...categories, newCategory];
      }

      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));

      // API에도 저장 시도
      try {
        const method = editingCategory ? "PUT" : "POST";
        const url = editingCategory 
          ? `/api/categories/${editingCategory.id}`
          : "/api/categories";

        await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryIndex: formData.categoryIndex,
            categoryName: formData.categoryName,
            description: formData.description || null,
          }),
        });
        
        setMessage(editingCategory ? "카테고리가 수정되었습니다" : "카테고리가 추가되었습니다");
      } catch (apiError) {
        console.warn('API 저장 실패, 로컬에만 저장됨:', apiError);
        setMessage(editingCategory ? "카테고리가 수정되었습니다 (로컬)" : "카테고리가 추가되었습니다 (로컬)");
      }

      setIsDialogOpen(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save category:", error);
      setMessage("카테고리 저장 실패");
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));

      // API에도 삭제 시도
      try {
        await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });
        setMessage("카테고리가 삭제되었습니다");
      } catch (apiError) {
        console.warn('API 삭제 실패, 로컬에만 삭제됨:', apiError);
        setMessage("카테고리가 삭제되었습니다 (로컬)");
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to delete category:", error);
      setMessage("카테고리 삭제 실패");
    }
  };

  if (loading) {
    return <div className="tab-content">로드 중...</div>;
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>카테고리 관리</h2>
        <p>상품의 카테고리를 관리합니다.</p>
      </div>

      <Button 
        onClick={() => handleOpenDialog()}
        className="add-button"
      >
        + 카테고리 추가
      </Button>

      {message && <div className="form-message">{message}</div>}

      <div className="categories-table">
        <table>
          <thead>
            <tr>
              <th>인덱스</th>
              <th>카테고리명</th>
              <th>설명</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-row">카테고리가 없습니다</td>
              </tr>
            ) : (
              categories.map(category => (
                <tr key={category.id}>
                  <td>{category.category_index}</td>
                  <td>{category.category_name}</td>
                  <td>{category.description || "-"}</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => handleOpenDialog(category)}
                      className="edit-btn"
                      title="수정"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
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

      {/* 카테고리 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="admin-dialog-content">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "카테고리 수정" : "카테고리 추가"}
            </DialogTitle>
          </DialogHeader>

          <div className="form-group">
            <Label htmlFor="categoryIndex">인덱스</Label>
            <Input
              id="categoryIndex"
              type="number"
              value={formData.categoryIndex}
              onChange={(e) => setFormData({ ...formData, categoryIndex: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <Label htmlFor="categoryName">카테고리명</Label>
            <Input
              id="categoryName"
              type="text"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              placeholder="카테고리명 입력"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="categoryDescription">설명</Label>
            <Input
              id="categoryDescription"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="설명 (선택사항)"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              {editingCategory ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
