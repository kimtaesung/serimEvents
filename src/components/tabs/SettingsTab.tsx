import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({
        type: "error",
        text: "모든 필드를 입력해주세요.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "새 비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "새 비밀번호는 최소 6자 이상이어야 합니다.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setMessage({
          type: "error",
          text: "인증 토큰을 찾을 수 없습니다. 다시 로그인해주세요.",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.message || "비밀번호 변경에 실패했습니다.",
        });
      } else {
        setMessage({
          type: "success",
          text: "비밀번호가 성공적으로 변경되었습니다.",
        });
        // 폼 초기화
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setMessage({
        type: "error",
        text: "비밀번호 변경 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        <h1 className="settings-title">설정</h1>

        {message && (
          <div className={`message-alert ${message.type}`}>
            {message.type === "success" ? "✓ " : "✕ "}
            {message.text}
          </div>
        )}

        <Card className="password-card">
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
            <CardDescription>
              관리자 계정의 비밀번호를 변경할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label htmlFor="current-password">현재 비밀번호</label>
                <div className="password-input-wrapper">
                  <Input
                    id="current-password"
                    type={showPasswords ? "text" : "password"}
                    placeholder="현재 비밀번호 입력"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new-password">새 비밀번호</label>
                <div className="password-input-wrapper">
                  <Input
                    id="new-password"
                    type={showPasswords ? "text" : "password"}
                    placeholder="새 비밀번호 입력 (최소 6자)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">비밀번호 확인</label>
                <div className="password-input-wrapper">
                  <Input
                    id="confirm-password"
                    type={showPasswords ? "text" : "password"}
                    placeholder="새 비밀번호 재입력"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group checkbox">
                <input
                  id="show-passwords"
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="show-passwords" className="checkbox-label">
                  비밀번호 표시
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="change-password-button"
              >
                {isLoading ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <style>{`
        .settings-container {
          padding: 2rem;
          max-width: 500px;
        }

        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .settings-title {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 0;
          color: var(--foreground);
        }

        .message-alert {
          padding: 1rem;
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 500;
          animation: slideIn 0.3s ease-out;
        }

        .message-alert.success {
          background: hsl(var(--success, 142.7 70.6% 45.3%));
          color: white;
          border: 1px solid hsl(var(--success, 142.7 70.6% 45.3%));
        }

        .message-alert.error {
          background: hsl(var(--destructive, 0 84.2% 60.2%));
          color: white;
          border: 1px solid hsl(var(--destructive, 0 84.2% 60.2%));
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .password-card {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--card);
        }

        .password-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--foreground);
        }

        .password-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .password-input-wrapper input {
          flex: 1;
          padding: 0.5rem 1rem;
          border: 1px solid var(--input);
          border-radius: var(--radius);
          background: var(--background);
          color: var(--foreground);
          font-size: 0.875rem;
        }

        .password-input-wrapper input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-group.checkbox {
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .form-group.checkbox input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }

        .checkbox-label {
          margin: 0;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .change-password-button {
          padding: 0.625rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 1rem;
        }

        .change-password-button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .change-password-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .settings-container {
            padding: 1rem;
          }

          .settings-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
