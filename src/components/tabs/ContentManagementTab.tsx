import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./tabs.css";

interface Section {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  images: string[];
  section_order: number;
  section_type: 'hero' | 'featured' | 'products' | 'content' | 'contact';
  is_active: boolean;
}

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero (메인 배너)' },
  { value: 'featured', label: 'Featured (주요 상품)' },
  { value: 'products', label: 'Products (상품 섹션)' },
  { value: 'content', label: 'Content (일반 콘텐츠)' },
];

export function ContentManagementTab() {
  const [sections, setSections] = useState<Section[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Section>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sections');
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      console.error('Failed to load sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (section: Section) => {
    console.log('Editing section:', section);
    console.log('Section images:', section.images);
    setEditingId(section.id);
    setFormData(section);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData({ ...formData, image_url: data.url });
      alert('이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드 실패');
    } finally {
      setIsUploadingImage(false);
      // 파일 입력 초기화
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingGallery(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', files[i]);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${files[i].name}`);
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      const currentImages = formData.images || [];
      setFormData({ 
        ...formData, 
        images: [...currentImages, ...uploadedUrls]
      });
      alert(`${uploadedUrls.length}개 이미지가 추가되었습니다.`);
    } catch (error) {
      console.error('Gallery upload error:', error);
      alert('이미지 업로드 실패');
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.section_type) {
      alert('제목과 섹션 타입을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const isEditing = editingId !== null && editingId !== -1;
      const url = isEditing 
        ? `/api/sections/${editingId}` 
        : '/api/sections';
      
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content || '',
          image_url: formData.image_url || null,
          images: formData.images || [],
          section_order: formData.section_order || 0,
          section_type: formData.section_type,
          is_active: formData.is_active !== false,
        }),
      });

      if (response.ok) {
        alert('저장되었습니다.');
        loadSections();
        handleCancel();
      } else {
        const errorData = await response.text();
        console.error('Save response:', { status: response.status, body: errorData });
        alert(`저장 실패 (${response.status}): ${errorData}`);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`저장 중 오류 발생: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/sections/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('삭제되었습니다.');
        loadSections();
      } else {
        alert('삭제 실패');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류 발생');
    } finally {
      setIsLoading(false);
    }
  };

  if (editingId !== null) {
    return (
      <div className="admin-tab-content">
        <h3 className="tab-subtitle">
          {editingId === -1 ? '새 섹션 추가' : '섹션 수정'}
        </h3>
        
        <div className="form-grid">
          <div className="form-group">
            <Label>제목 *</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="섹션 제목"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="section-type">섹션 타입 *</Label>
            <select
              id="section-type"
              title="섹션 타입 선택"
              value={formData.section_type || 'content'}
              onChange={(e) => setFormData({ ...formData, section_type: e.target.value as any })}
            >
              {SECTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <Label>표시 순서</Label>
            <Input
              type="number"
              value={formData.section_order || 0}
              onChange={(e) => setFormData({ ...formData, section_order: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <Label>이미지 URL</Label>
            <Input
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <Label>이미지 업로드</Label>
            <div className="image-upload-input">
              <input
                type="file"
                accept="image/*"
                title="이미지 파일 선택"
                placeholder="이미지 파일 선택"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
              />
              {isUploadingImage && <span className="image-upload-status">업로드 중...</span>}
            </div>
            {formData.image_url && (
              <div className="image-preview-container">
                <p className="image-preview-label">이미지 미리보기:</p>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="image-preview-img"
                  onError={() => alert('이미지를 불러올 수 없습니다.')}
                />
              </div>
            )}
          </div>

          {formData.section_type === 'hero' && (
            <div className="form-group">
              <Label>추가 이미지 (Hero 캐러셀용)</Label>
              <div className="image-upload-input">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  title="여러 이미지 파일 선택"
                  onChange={handleGalleryUpload}
                  disabled={isUploadingGallery}
                />
                {isUploadingGallery && <span className="image-upload-status">업로드 중...</span>}
              </div>
              {(formData.images || []).length > 0 && (
                <div className="gallery-preview">
                  <p className="image-preview-label">추가 이미지들:</p>
                  <div className="gallery-grid">
                    {formData.images?.map((url, idx) => (
                      <div key={idx} className="gallery-item">
                        <img 
                          src={url} 
                          alt={`Gallery ${idx}`}
                          className="gallery-preview-img"
                          onError={() => console.error('Cannot load image:', url)}
                        />
                        <button
                          type="button"
                          className="gallery-item-delete"
                          onClick={() => {
                            const newImages = formData.images?.filter((_, i) => i !== idx) || [];
                            setFormData({ ...formData, images: newImages });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <div className="form-checkbox-group">
              <Switch
                checked={formData.is_active !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label style={{ margin: 0 }}>활성화</Label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <Label>콘텐츠</Label>
          <div className="quill-editor-container">
            <ReactQuill
              value={formData.content || ''}
              onChange={(value) => setFormData({ ...formData, content: value })}
              modules={quillModules}
              formats={quillFormats}
              theme="snow"
              style={{ height: '300px' }}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tab-content">
      <div className="flex-header">
        <h3 className="tab-subtitle">섹션 관리</h3>
        <Button 
          onClick={() => {
            setEditingId(-1);
            setFormData({ section_type: 'content', is_active: true });
          }}
          disabled={isLoading}
        >
          + 새 섹션 추가
        </Button>
      </div>

      {isLoading ? (
        <p>로딩 중...</p>
      ) : sections.length === 0 ? (
        <p>섹션이 없습니다.</p>
      ) : (
        <div className="section-list">
          {sections.map((section) => (
            <div key={section.id} className={`section-item ${section.section_type === 'hero' ? 'section-item-hero' : ''}`}>
              <div className="section-item-header">
                <div>
                  <h4 className="section-item-title">{section.title}</h4>
                  <p className="section-item-meta">
                    타입: {SECTION_TYPES.find(t => t.value === section.section_type)?.label} | 순서: {section.section_order}
                  </p>
                  <p className="section-item-meta">
                    상태: {section.is_active ? '활성화' : '비활성화'}
                  </p>
                  {section.section_type === 'hero' && section.images && section.images.length > 0 && (
                    <p className="section-item-meta">
                      이미지: {section.images.length}개
                    </p>
                  )}
                </div>
                <div className="section-item-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(section)}
                    disabled={isLoading}
                  >
                    수정
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(section.id)}
                    disabled={isLoading}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean'],
    ],
    handlers: {
      image: imageHandler,
    }
  },
};

// 이미지 업로드 핸들러
async function imageHandler(this: any) {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      const quill = this.quill;
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', data.url);
      quill.setSelection(range.index + 1);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드 실패');
    }
  };
}

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'blockquote', 'code-block',
  'align',
  'link', 'image',
];
