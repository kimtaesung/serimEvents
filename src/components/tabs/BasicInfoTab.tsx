import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import "./tabs.css";

interface BasicInfo {
  [key: string]: string | null;
}

const BASIC_INFO_KEYS = [
  "company-info",
  "company-info-description",
  "customer-support",
  "customer-support-list",
  "contact",
  "contact-description",
];

const BASIC_INFO_LABELS = {
  "company-info": "회사 정보",
  "company-info-description": "회사 정보 설명",
  "customer-support": "고객 지원",
  "customer-support-list": "고객 지원 목록",
  "contact": "연락처",
  "contact-description": "연락처 설명",
};

// 로컬 스토리지에서 데이터 불러오기
const loadBasicInfo = (): BasicInfo => {
  try {
    const stored = localStorage.getItem('basicInfo');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load basic info from localStorage:', error);
  }
  
  // 기본값
  return {
    "company-info": "SERIM ROBO는 최고의 로봇 기술을 제공합니다.",
    "company-info-description": "최고의 로봇 기술로 미래를 만들어갑니다.",
    "customer-support": "고객 지원",
    "customer-support-list": "자주 묻는 질문\n배송 안내\n반품/교환",
    "contact": "연락처",
    "contact-description": "이메일: support@serimrobo.com\n전화: 1588-0000",
  };
};

export function BasicInfoTab() {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(loadBasicInfo());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (key: string, value: string) => {
    setBasicInfo(prev => ({
      ...prev,
      [key]: value || null
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      // 로컬 스토리지에 저장
      localStorage.setItem('basicInfo', JSON.stringify(basicInfo));

      // API에도 저장 시도
      try {
        const savePromises = BASIC_INFO_KEYS.map(key =>
          fetch("/api/basic-info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              infoKey: key,
              infoValue: basicInfo[key] || null,
            }),
          })
        );

        await Promise.all(savePromises);
        setMessage("기본정보가 저장되었습니다. (DB)");
      } catch (apiError) {
        console.warn('API 저장 실패, 로컬 스토리지에만 저장됨:', apiError);
        setMessage("기본정보가 저장되었습니다. (로컬)");
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save basic info:", error);
      setMessage("기본정보 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>기본정보 관리</h2>
        <p>회사정보, 고객지원, 연락처 등 기본 정보를 관리합니다.</p>
      </div>

      <form className="form-container">
        {BASIC_INFO_KEYS.map(key => (
          <div key={key} className="form-group">
            <Label htmlFor={key}>
              {BASIC_INFO_LABELS[key as keyof typeof BASIC_INFO_LABELS]}
            </Label>
            {key.includes("list") ? (
              <Textarea
                id={key}
                value={basicInfo[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="줄바꿈으로 항목을 구분하세요"
                rows={4}
              />
            ) : (
              <Input
                id={key}
                type="text"
                value={basicInfo[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="입력하지 않으면 null로 저장됩니다"
              />
            )}
          </div>
        ))}

        {message && (
          <div className="form-message">
            {message}
          </div>
        )}

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="save-button"
        >
          {saving ? "저장 중..." : "저장하기"}
        </Button>
      </form>
    </div>
  );
}
