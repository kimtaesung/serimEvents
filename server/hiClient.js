const axios = require('axios');
const request = require('request');
require('dotenv').config({ path: '../gabiaPublish/.env' });

class HiWorksClient {
  constructor() {
    this.officeToken = process.env.HIWORKS_OFFICE_TOKEN;
    this.apiUrl = process.env.HIWORKS_API_URL || 'https://api.hiworks.com';
    this.templateCode = process.env.KAKAO_TEMPLATE_CODE;
    this.senderPhone = process.env.KAKAO_SENDER_PHONE;
    // 카카오 알림톡 전송 활성화 여부 (환경변수: 'true' 또는 'false' 문자열)
    this.enableKakaoNotification = process.env.ENABLE_KAKAO_NOTIFICATION === 'true';
    // 메일 발송 설정
    this.mailUserId = process.env.HIWORKS_MAIL_USER_ID;
    this.mailCooldown = parseInt(process.env.MAIL_SEND_COOLDOWN_MINUTES || '10') * 60 * 1000; // 기본값: 10분
  }

  /**
   * 하이웍스 API 요청 헤더 생성
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.officeToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * 메일 내용을 HTML 형식으로 포맷팅
   * @param {string|Object} content - 메일 내용 (문자열 또는 객체)
   * @returns {string} HTML 형식의 메일 내용
   */
  formatMailContent(content) {
    let htmlContent = '';
    let contentObj = content;

    // content가 JSON 문자열인 경우 파싱
    if (typeof content === 'string') {
      try {
        contentObj = JSON.parse(content);
      } catch (e) {
        // JSON 파싱 실패 시 문자열로 취급
        contentObj = content;
      }
    }

    // content가 객체인 경우 (예: 문의 정보)
    if (typeof contentObj === 'object' && contentObj !== null) {
      htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; }
              .mail-container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .mail-header { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
              .mail-header h1 { margin: 0; color: #2c3e50; font-size: 24px; }
              .mail-body { background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
              .info-row { margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
              .info-row:last-child { border-bottom: none; }
              .info-label { font-weight: bold; color: #2c3e50; display: inline-block; width: 150px; }
              .info-value { color: #555; word-break: break-word; }
              .mail-footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="mail-container">
              <div class="mail-header">
                <h1>📋 신규 문의 접수</h1>
              </div>
              <div class="mail-body">
                ${contentObj.manager_name ? `<div class="info-row"><span class="info-label">성명(상호명):</span> <span class="info-value">${this.escapeHtml(contentObj.manager_name)}</span></div>` : ''}
                ${contentObj.phone_number ? `<div class="info-row"><span class="info-label">연락처:</span> <span class="info-value">${this.escapeHtml(contentObj.phone_number)}</span></div>` : ''}
                ${contentObj.manager_address ? `<div class="info-row"><span class="info-label">소재지:</span> <span class="info-value">${this.escapeHtml(contentObj.manager_address)}</span></div>` : ''}
                ${contentObj.product_type ? `<div class="info-row"><span class="info-label">문의제품:</span> <span class="info-value">${this.escapeHtml(contentObj.product_type)}</span></div>` : ''}
                ${contentObj.consultation_contents ? `<div class="info-row"><span class="info-label">문의내용:</span> <span class="info-value">${this.escapeHtml(contentObj.consultation_contents).replace(/\n/g, '<br>')}</span></div>` : ''}
                ${contentObj.inquiry_time ? `<div class="info-row"><span class="info-label">접수시간:</span> <span class="info-value">${this.escapeHtml(contentObj.inquiry_time)}</span></div>` : ''}
              </div>
              <div class="mail-footer">
                <p>이 이메일은 자동으로 발송된 메일입니다.</p>
                <p>© 2024 세림로보틱스. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else {
      // content가 문자열인 경우
      const contentStr = String(contentObj || '');
      htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; }
              .mail-container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .mail-body { background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; }
              .mail-footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="mail-container">
              <div class="mail-body">
                ${contentStr.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
              </div>
              <div class="mail-footer">
                <p>이 이메일은 자동으로 발송된 메일입니다.</p>
                <p>© 2024 세림로보틱스. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    return htmlContent.trim();
  }

  /**
   * HTML 특수문자 이스케이프 처리
   * @param {string} text - 변환할 텍스트
   * @returns {string} 이스케이프 처리된 텍스트
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * 모든 사원 목록 조회
   * @returns {Promise<Array>} 사원 목록
   */
  async getAllEmployees() {
    try {
      const response = await axios.get(`${this.apiUrl}/user/v2/users`, {
        headers: this.getHeaders()
      });

      if (response.data.code === 'SUC') {
        return response.data.data.list || [];
      } else {
        console.error('사원 목록 조회 실패:', response.data.msg);
        return [];
      }
    } catch (error) {
      console.error('사원 목록 조회 중 오류:', error.message);
      return [];
    }
  }

  /**
   * 카카오 알림톡 발송 (단일 수신자)
   * @param {string} phone - 수신자 전화번호
   * @param {Object} templateData - 템플릿 데이터
   * @returns {Promise<Object>} 발송 결과
   */
  async sendKakaoMessage(phone, templateData) {
    try {
      const messageData = {
        template_code: this.templateCode,
        to: phone,
        from: this.senderPhone,
        template_parameter: templateData,
        re_send: 'Y', // 실패 시 SMS 재전송
        re_send_subject: '세림로보틱스 신규 문의',
        re_send_message: `신규 문의가 접수되었습니다.\n성명: ${templateData.manager_name}\n연락처: ${templateData.phone_number}\n제품: ${templateData.product_type}`
      };

      const response = await axios.post(`${this.apiUrl}/kakao/v2/messages`, messageData, {
        headers: this.getHeaders()
      });

      return {
        success: response.data.code === 'SUC',
        data: response.data,
        phone: phone
      };
    } catch (error) {
      console.error(`카카오 메시지 발송 실패 (${phone}):`, error.message);
      return {
        success: false,
        error: error.message,
        phone: phone
      };
    }
  }

  /**
   * 모든 사원에게 신규 문의 알림 전송
   * @param {Object} inquiryData - 문의 데이터
   * @param {boolean} sendNotification - 알림 전송 여부 (기본값: true)
   * @returns {Promise<Object>} 전송 결과 요약
   */
  async notifyAllEmployeesNewInquiry(inquiryData, sendNotification = true) {
    try {
      // 환경변수 ENABLE_KAKAO_NOTIFICATION과 매개변수 모두 체크
      const shouldSend = this.enableKakaoNotification && sendNotification;
      
      if (!shouldSend) {
        console.log('⏭️  카카오 알림톡 전송 건너뜀 (환경변수 또는 사용자 설정으로 비활성화됨)');
        return {
          success: true,
          message: '카카오 알림톡 전송이 비활성화되었습니다.',
          skipped: true,
          results: []
        };
      }

      console.log('📢 신규 문의 알림 전송 시작...');
      
      // 1. 모든 사원 목록 조회
      const employees = await this.getAllEmployees();
      
      if (employees.length === 0) {
        console.log('⚠️ 알림을 받을 사원이 없습니다.');
        return {
          success: false,
          message: '알림을 받을 사원이 없습니다.',
          results: []
        };
      }

      console.log(`👥 총 ${employees.length}명의 사원에게 알림 전송 중...`);

      // 2. 템플릿 데이터 준비
      const templateData = {
        manager_name: inquiryData.manager_name,
        phone_number: inquiryData.phone_number,
        manager_address: inquiryData.manager_address,
        product_type: inquiryData.product_type,
        consultation_contents: inquiryData.consultation_contents || '문의 내용 없음',
        inquiry_time: new Date().toLocaleString('ko-KR')
      };

      // 3. 모든 사원에게 개별 전송
      const sendPromises = employees
        .filter(employee => employee.mobile_no) // 휴대폰 번호가 있는 사원만
        .map(employee => this.sendKakaoMessage(employee.mobile_no, templateData));

      const results = await Promise.allSettled(sendPromises);
      
      // 4. 결과 집계
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      );
      const failed = results.filter(result => 
        result.status === 'rejected' || !result.value.success
      );

      console.log(`✅ 전송 완료: 성공 ${successful.length}건, 실패 ${failed.length}건`);

      return {
        success: true,
        message: `카카오 알림톡 전송 완료 (성공: ${successful.length}건, 실패: ${failed.length}건)`,
        totalEmployees: employees.length,
        successCount: successful.length,
        failureCount: failed.length,
        results: results.map(result => result.value || result.reason)
      };

    } catch (error) {
      console.error('❌ 전체 알림 전송 중 오류:', error.message);
      return {
        success: false,
        message: `알림 전송 중 오류가 발생했습니다: ${error.message}`,
        results: []
      };
    }
  }

  /**
   * 카카오 메시지 전송 상태 조회
   * @param {string} messageId - 메시지 ID
   * @returns {Promise<Object>} 전송 상태
   */
  async getMessageStatus(messageId) {
    try {
      const response = await axios.get(`${this.apiUrl}/kakao/v2/messages/${messageId}`, {
        headers: this.getHeaders()
      });

      return {
        success: response.data.code === 'SUC',
        data: response.data
      };
    } catch (error) {
      console.error('메시지 상태 조회 실패:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * API 연결 테스트
   * @returns {Promise<boolean>} 연결 성공 여부
   */
  async testConnection() {
    try {
      const employees = await this.getAllEmployees();
      console.log('✅ 하이웍스 API 연결 성공');
      console.log(`📊 조회된 사원 수: ${employees.length}명`);
      return true;
    } catch (error) {
      console.error('❌ 하이웍스 API 연결 실패:', error.message);
      return false;
    }
  }

  /**
   * IP 주소로부터 마지막 메일 발송 시간 조회
   * @param {string} ip - IP 주소
   * @param {Object} db - 데이터베이스 어댑터
   * @returns {Promise<Date|null>} 마지막 발송 시간 또는 null
   */
  async getLastMailSendTime(ip, db) {
    try {
      const query = `
        SELECT sent_at FROM mail_log 
        WHERE sender_ip = ? AND status = 'sent' 
        ORDER BY sent_at DESC LIMIT 1
      `;
      const results = await db.query(query, [ip]);
      return results.length > 0 ? new Date(results[0].sent_at) : null;
    } catch (error) {
      console.error('메일 발송 시간 조회 실패:', error.message);
      return null;
    }
  }

  /**
   * IP 주소의 메일 발송 가능 여부 확인
   * @param {string} ip - IP 주소
   * @param {Object} db - 데이터베이스 어댑터
   * @returns {Promise<Object>} { canSend: boolean, remainingTime: number }
   */
  async canSendMail(ip, db) {
    try {
      const lastSendTime = await this.getLastMailSendTime(ip, db);
      
      if (!lastSendTime) {
        return { canSend: true, remainingTime: 0 };
      }

      const now = new Date();
      const timeDiff = now - lastSendTime;
      
      if (timeDiff >= this.mailCooldown) {
        return { canSend: true, remainingTime: 0 };
      }

      const remainingTime = Math.ceil((this.mailCooldown - timeDiff) / 1000); // 초 단위
      return { canSend: false, remainingTime };
    } catch (error) {
      console.error('메일 발송 가능 여부 확인 실패:', error.message);
      return { canSend: false, remainingTime: 0 };
    }
  }

  /**
   * 하이웍스 메일 API를 통해 메일 발송
   * @param {Object} mailData - 메일 데이터
   * @param {string} mailData.to - 수신자 이메일
   * @param {string} mailData.cc - CC 이메일 (선택사항)
   * @param {string} mailData.bcc - BCC 이메일 (선택사항)
   * @param {string} mailData.subject - 메일 제목
   * @param {string} mailData.content - 메일 내용
   * @param {string} senderIp - 발신자 IP
   * @param {Object} db - 데이터베이스 어댑터
   * @returns {Promise<Object>} 발송 결과
   */
  async sendMail(mailData, senderIp, db) {
    try {
      console.log(`📧 메일 발송 시작 - 수신자: ${mailData.to}, 발신자IP: ${senderIp}`);

      // 1. 메일 발송 가능 여부 확인
      const { canSend, remainingTime } = await this.canSendMail(senderIp, db);
      
      if (!canSend) {
        console.log(`⏳ 메일 발송 대기 중 - 남은 시간: ${remainingTime}초`);
        return {
          success: false,
          message: `메일을 보낸 지 10분이 경과하지 않았습니다. ${remainingTime}초 후 다시 시도해주세요.`,
          remainingTime,
          canSend: false
        };
      }

      // 2. 메일 로그 DB 기록 (발송 전)
      // content가 JSON 문자열인 경우 그대로, 아니면 변환
      let contentForDb = '';
      if (typeof mailData.content === 'string') {
        contentForDb = mailData.content;
      } else if (typeof mailData.content === 'object' && mailData.content !== null) {
        contentForDb = JSON.stringify(mailData.content);
      } else {
        contentForDb = String(mailData.content || '');
      }

      const logInsertQuery = `
        INSERT INTO mail_log 
        (sender_ip, recipient_email, subject, content, status) 
        VALUES (?, ?, ?, ?, ?)
      `;
      const logResult = await db.query(logInsertQuery, [
        senderIp,
        mailData.to,
        mailData.subject || '',
        contentForDb,
        'pending'
      ]);
      const logId = logResult[0]?.insertId;

      // 3. 메일 내용을 HTML로 포맷팅
      const formattedContent = this.formatMailContent(mailData.content);

      // 4. 하이웍스 메일 발송 API 호출
      const options = {
        method: 'POST',
        url: `${this.apiUrl}/office/v2/webmail/sendMail`,
        headers: {
          'Authorization': `Bearer ${this.officeToken}`
        },
        formData: {
          'to': mailData.to,
          'user_id': this.mailUserId,
          'cc': mailData.cc || '',
          'bcc': mailData.bcc || '',
          'subject': mailData.subject,
          'content': formattedContent,
          'save_sent_mail': 'Y'
        }
      };

      return new Promise((resolve) => {
        request(options, async (error, response, body) => {
          try {
            if (error) {
              throw error;
            }

            console.log(`📧 API 응답: ${body}`);
            console.log(`📧 응답 상태 코드: ${response.statusCode}`);

            // JSON 응답 파싱 시도
            let responseData = {};
            try {
              responseData = typeof body === 'string' ? JSON.parse(body) : body;
            } catch (e) {
              console.log('JSON 파싱 실패, 문자열로 처리');
              responseData = { msg: body, raw: body };
            }

            console.log(`📧 파싱된 응답: ${JSON.stringify(responseData)}`);

            // 발송 성공 조건 확인
            const isSuccess = 
              responseData.code === 'SUC' ||
              responseData.code === 'OK' ||
              body === 'Accepted' ||
              response.statusCode === 200;

            if (isSuccess) {
              const updateQuery = `
                UPDATE mail_log SET status = 'sent', sent_at = NOW() WHERE id = ?
              `;
              await db.query(updateQuery, [logId]);

              console.log(`✅ 메일 발송 성공 - 수신자: ${mailData.to}`);
              resolve({
                success: true,
                message: '메일이 성공적으로 발송되었습니다.',
                logId
              });
              return;
            }

            // 실패 처리
            const errorMsg = responseData.message || responseData.msg || response.statusMessage || body || '알 수 없는 오류';
            const updateQuery = `
              UPDATE mail_log SET status = 'failed', error_message = ? WHERE id = ?
            `;
            await db.query(updateQuery, [errorMsg, logId]);

            console.error(`❌ 메일 발송 실패: ${errorMsg}`);
            resolve({
              success: false,
              message: `메일 발송 실패: ${errorMsg}`,
              error: errorMsg,
              logId
            });

          } catch (error) {
            console.error('❌ 메일 발송 중 오류:', error.message);
            
            // 오류 로그 업데이트
            try {
              const updateQuery = `
                UPDATE mail_log SET status = 'failed', error_message = ? WHERE id = ?
              `;
              await db.query(updateQuery, [error.message, logId]);
            } catch (dbError) {
              console.error('DB 업데이트 실패:', dbError.message);
            }

            resolve({
              success: false,
              message: `메일 발송 중 오류가 발생했습니다: ${error.message}`,
              error: error.message,
              logId
            });
          }
        });
      });
    } catch (error) {
      console.error('❌ 메일 발송 준비 중 오류:', error.message);
      return {
        success: false,
        message: `메일 발송 준비 중 오류가 발생했습니다: ${error.message}`,
        error: error.message
      };
    }
  }
}

module.exports = HiWorksClient;
