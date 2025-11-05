import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import './InquiryManagementTab.css';
import { toast } from 'sonner';

interface Inquiry {
  id: number;
  phone_number: string;
  manager_name: string;
  manager_address: string | null;
  table_number: number | null;
  product_type: string;
  consultation_contents: string | null;
  has_agreement: boolean;
  status: 'pending' | 'reviewed' | 'completed';
  created_at: string;
  updated_at: string;
}

export function InquiryManagementTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'reviewed' | 'completed'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/inquiries');
      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      } else {
        toast.error('문의 목록 로드 실패');
      }
    } catch (error) {
      console.error('Error loading inquiries:', error);
      toast.error('문의 목록 로드 중 오류 발생');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'pending' | 'reviewed' | 'completed') => {
    try {
      const response = await fetch(`/api/inquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setInquiries(prev => prev.map(inq => 
          inq.id === id ? { ...inq, status: newStatus } : inq
        ));
        toast.success('상태 업데이트 완료');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('상태 업데이트 실패');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setInquiries(prev => prev.filter(inq => inq.id !== id));
        toast.success('문의 삭제 완료');
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('문의 삭제 실패');
    }
  };

  const filteredInquiries = selectedStatus === 'all' 
    ? inquiries 
    : inquiries.filter(inq => inq.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'reviewed': return '#60a5fa';
      case 'completed': return '#34d399';
      default: return '#9ca3af';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기 중';
      case 'reviewed': return '검토 중';
      case 'completed': return '완료';
      default: return status;
    }
  };

  return (
    <div className="inquiry-management-tab">
      <div className="inquiry-header">
        <h2>문의 관리</h2>
        <p className="inquiry-subtitle">고객으로부터 접수된 문의를 관리하세요</p>
      </div>

      {/* 필터 */}
      <div className="inquiry-filter">
        <div className="filter-buttons">
          {(['all', 'pending', 'reviewed', 'completed'] as const).map(status => (
            <button
              key={status}
              className={`filter-btn ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
            >
              {status === 'all' ? '전체' : getStatusLabel(status)}
              <span className="filter-count">
                {status === 'all' 
                  ? inquiries.length 
                  : inquiries.filter(inq => inq.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 문의 목록 */}
      <div className="inquiry-list">
        {isLoading ? (
          <div className="loading">로딩 중...</div>
        ) : filteredInquiries.length === 0 ? (
          <div className="empty-state">
            <p>문의가 없습니다</p>
          </div>
        ) : (
          filteredInquiries.map(inquiry => (
            <div key={inquiry.id} className="inquiry-card">
              <div className="inquiry-card-header">
                <div className="inquiry-info">
                  <h3>{inquiry.manager_name}</h3>
                  <p className="inquiry-phone">{inquiry.phone_number}</p>
                </div>
                <div className="inquiry-meta">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(inquiry.status) }}
                  >
                    {getStatusLabel(inquiry.status)}
                  </span>
                  <span className="inquiry-date">
                    {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>

              <button
                className="expand-btn"
                onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
              >
                {expandedId === inquiry.id ? '▼' : '▶'} 상세보기
              </button>

              {expandedId === inquiry.id && (
                <div className="inquiry-details">
                  <div className="detail-row">
                    <label>담당자명:</label>
                    <span>{inquiry.manager_name}</span>
                  </div>
                  <div className="detail-row">
                    <label>연락처:</label>
                    <span>{inquiry.phone_number}</span>
                  </div>
                  {inquiry.manager_address && (
                    <div className="detail-row">
                      <label>담당자 소재지:</label>
                      <span>{inquiry.manager_address}</span>
                    </div>
                  )}
                  {inquiry.table_number && (
                    <div className="detail-row">
                      <label>테이블 수:</label>
                      <span>{inquiry.table_number}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <label>상품 유형:</label>
                    <span>{inquiry.product_type}</span>
                  </div>
                  {inquiry.consultation_contents && (
                    <div className="detail-row">
                      <label>상담 내용:</label>
                      <p className="consultation-text">{inquiry.consultation_contents}</p>
                    </div>
                  )}
                  <div className="detail-row">
                    <label>접수 일시:</label>
                    <span>{new Date(inquiry.created_at).toLocaleString('ko-KR')}</span>
                  </div>

                  {/* 상태 변경 */}
                  <div className="status-change-section">
                    <label>상태 변경:</label>
                    <div className="status-buttons">
                      {(['pending', 'reviewed', 'completed'] as const).map(status => (
                        <button
                          key={status}
                          className={`status-btn ${inquiry.status === status ? 'active' : ''}`}
                          onClick={() => handleStatusChange(inquiry.id, status)}
                        >
                          {getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 삭제 버튼 */}
                  <div className="action-buttons">
                    <Button
                      onClick={() => handleDelete(inquiry.id)}
                      className="delete-btn"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
