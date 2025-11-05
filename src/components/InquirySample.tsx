import * as React from "react"
import LeftBot from "../assets/events/17_left.png"
import RightBot from "../assets/events/17_right.png"
import TitleImage from "../assets/events/17_top.png"
import "./InquirySample.css"
import { useState } from "react"

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    manager_name: '',
    phone_number: '',
    manager_address: '',
    product_type: '청소로봇',
    consultation_contents: '',
    has_agreement: false
  });  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.has_agreement) {
      alert('개인정보 보호정책에 동의해주세요.');
      return;
    }

    // 데이터를 db inquiries테이블에 저장
    const inquiryData = {
      manager_name: formData.manager_name,
      phone_number: formData.phone_number,
      manager_address: formData.manager_address,
      product_type: formData.product_type,
      consultation_contents: formData.consultation_contents,
      has_agreement: formData.has_agreement
    };
    
    // api로 전송하는 부분 (예: fetch 사용)
    fetch('/api/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inquiryData)
    })
    .then(response => {
      console.log('📤 Response status:', response.status);
      if (response.ok) {
        return response.json().then(data => {
          console.log('✅ Success response:', data);
          alert('문의가 접수되었습니다.');
          setFormData({
            manager_name: '',
            phone_number: '',
            manager_address: '',
            product_type: '청소로봇',
            consultation_contents: '',
            has_agreement: false
          });
        });
      } else {
        return response.json().then(data => {
          console.error('❌ Error response:', data);
          alert('문의 접수에 실패했습니다. 다시 시도해주세요.');
        });
      }
    })
    .catch(error => {
      console.error('❌ Error submitting form:', error);
      alert('네트워크 오류가 발생했습니다.');
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="inquiry-form-container">
      {/* 상단 타이틀 */}
      <div className="inquiry-title">
        <img src={TitleImage} alt="타이틀" />
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="inquiry-form-wrapper">
        {/* 성명(상호명) */}
        <div className="form-group">
          <label className="form-label">
            성명(상호명)
            <span className="required-mark">*</span>
          </label>
          <input
            required
            type="text"
            name="manager_name"
            value={formData.manager_name}
            onChange={handleChange}
            placeholder="성명을 입력하세요"
            className="form-input"
          />
        </div>

        {/* 연락처 */}
        <div className="form-group">
          <label className="form-label">
            연락처
            <span className="required-mark">*</span>
          </label>
          <input
            required
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="010-0000-0000"
            className="form-input"
          />
        </div>

        {/* 소재지 */}
        <div className="form-group">
          <label className="form-label">
            소재지
            <span className="required-mark">*</span>
          </label>
          <input
            required
            type="text"
            name="manager_address"
            value={formData.manager_address}
            onChange={handleChange}
            placeholder="ex. 경기도 용인"
            className="form-input"
          />
        </div>

        {/* 문의제품 */}
        <div className="form-group">
          <label className="form-label">
            문의제품
            <span className="required-mark">*</span>
          </label>
          <div className="radio-options">
            <label className="radio-label">
              <input
                type="radio"
                name="product_type"
                value="청소로봇"
                checked={formData.product_type === '청소로봇'}
                onChange={handleChange}
              />
              <span>청소로봇</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="product_type"
                value="서빙로봇"
                checked={formData.product_type === '서빙로봇'}
                onChange={handleChange}
              />
              <span>서빙로봇</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="product_type"
                value="물류로봇"
                checked={formData.product_type === '물류로봇'}
                onChange={handleChange}
              />
              <span>물류로봇</span>
            </label>
          </div>
        </div>

        {/* 문의사항 */}
        <div className="form-group">
          <label className="form-label">문의사항</label>
          <textarea
            name="consultation_contents"
            value={formData.consultation_contents}
            onChange={handleChange}
            placeholder="문의 내용을 입력하세요"
            className="form-textarea"
          />
        </div>

        {/* 개인정보 동의 */}
        <label className="form-checkbox">
          <input
            type="checkbox"
            name="has_agreement"
            checked={formData.has_agreement}
            onChange={handleChange}
          />
          <span>개인정보 보호정책에 따라 개인 데이터를 공유하는 데 동의합니다.</span>
        </label>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="form-submit"
        >
          문의하기
        </button>
      </form>

      {/* 좌우 로봇 */}
      <div className="inquiry-robot-left">
        <img src={LeftBot} alt="왼쪽 로봇" />
      </div>
      <div className="inquiry-robot-right">
        <img src={RightBot} alt="오른쪽 로봇" />
      </div>
    </div>
  )
}
