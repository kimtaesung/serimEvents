const express = require('express');
const router = express.Router();
const db = require('../database/db-adapter');
const HiWorksClient = require('../hiClient');

// HiWorks 클라이언트 인스턴스 생성
const hiWorksClient = new HiWorksClient();

// 모든 문의 조회 (관리자용)
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM inquiries ORDER BY created_at DESC';
    const results = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// 문의 상태 조회 (상태별 카운트)
router.get('/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM inquiries
      GROUP BY status
    `;
    const results = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching inquiry stats:', error);
    res.status(500).json({ error: 'Failed to fetch inquiry stats' });
  }
});

// 특정 문의 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM inquiries WHERE id = ?';
    const results = await db.query(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
});

// 문의 생성
router.post('/', async (req, res) => {
  try {
    const {
      phone_number,
      manager_name,
      manager_address,
      product_type,
      consultation_contents,
      has_agreement,
      send_kakao_notification
    } = req.body;

    console.log('📝 Received inquiry data:', {
      phone_number,
      manager_name,
      manager_address,
      product_type,
      consultation_contents,
      has_agreement,
      send_kakao_notification
    });

    // 필수 필드 검증
    if (!phone_number || !manager_name || !has_agreement) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields: phone_number, manager_name, has_agreement'
      });
    }

    const query = `
      INSERT INTO inquiries (
        phone_number,
        manager_name,
        manager_address,
        product_type,
        consultation_contents,
        has_agreement,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;

    console.log('📊 Executing query with values:', [
      phone_number,
      manager_name,
      manager_address || null,
      product_type || null,
      consultation_contents || null,
      has_agreement
    ]);

    const result = await db.query(query, [
      phone_number,
      manager_name,
      manager_address || null,
      product_type || null,
      consultation_contents || null,
      has_agreement
    ]);

    console.log('✅ Inquiry saved successfully. Result:', result);

    // 새 문의가 저장되면 카카오톡 알림 전송 (환경변수 + 사용자 선택 모두 고려)
    const inquiryData = {
      manager_name,
      phone_number,
      manager_address: manager_address || '정보 없음',
      product_type: product_type || '정보 없음',
      consultation_contents: consultation_contents || '문의 내용 없음'
    };

    // 백그라운드에서 카카오톡 알림 및 메일 전송 (응답 지연 방지)
    setImmediate(async () => {
      try {
        // 1. 카카오톡 알림 전송
        console.log('📱 카카오톡 알림 전송 시도 (환경변수: ENABLE_KAKAO_NOTIFICATION=${process.env.ENABLE_KAKAO_NOTIFICATION}, 사용자선택: ${send_kakao_notification})');
        const notificationResult = await hiWorksClient.notifyAllEmployeesNewInquiry(inquiryData, send_kakao_notification);
        
        if (notificationResult.success || notificationResult.skipped) {
          console.log('✅ 카카오톡 알림 처리 완료:', notificationResult.message);
        } else {
          console.error('❌ 카카오톡 알림 전송 실패:', notificationResult.message);
        }

        // 2. 메일 자동 전송
        try {
          console.log('📧 메일 자동 전송 시작...');
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@serimrobo.com';
          const senderIp = '127.0.0.1'; // 백그라운드 작업이므로 내부 IP 사용

          // content를 JSON 문자열로 미리 변환
          const mailContentJson = JSON.stringify(inquiryData);

          const mailData = {
            to: adminEmail,
            subject: `[신규 문의] ${manager_name}님으로부터 문의가 접수되었습니다.`,
            content: mailContentJson // 문자열로 전달
          };

          const mailResult = await hiWorksClient.sendMail(mailData, senderIp, db);

          if (mailResult.success) {
            console.log('✅ 메일 발송 완료:', mailResult.message);
          } else {
            console.warn('⚠️ 메일 발송 실패:', mailResult.message);
          }
        } catch (mailError) {
          console.error('❌ 메일 발송 중 예외 발생:', mailError.message);
        }
      } catch (error) {
        console.error('❌ 카카오톡 알림 전송 중 예외 발생:', error.message);
      }
    });

    res.status(201).json({
      success: true,
      id: result[0]?.insertId || 0,
      message: 'Inquiry created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating inquiry:', error);
    res.status(500).json({ 
      error: 'Failed to create inquiry',
      details: error.message 
    });
  }
});

// 문의 상태 업데이트 (관리자용)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const query = 'UPDATE inquiries SET status = ? WHERE id = ?';
    await db.query(query, [status, id]);

    res.json({ success: true, message: 'Inquiry status updated' });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ error: 'Failed to update inquiry status' });
  }
});

// 문의 삭제 (관리자용)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM inquiries WHERE id = ?';
    await db.query(query, [id]);

    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

// 하이웍스 API 연결 테스트 (관리자용)
router.get('/test/hiworks', async (req, res) => {
  try {
    console.log('🔧 하이웍스 API 연결 테스트 시작...');
    const isConnected = await hiWorksClient.testConnection();
    
    if (isConnected) {
      res.json({ 
        success: true, 
        message: '하이웍스 API 연결 성공' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: '하이웍스 API 연결 실패' 
      });
    }
  } catch (error) {
    console.error('하이웍스 API 테스트 중 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: `하이웍스 API 테스트 실패: ${error.message}` 
    });
  }
});

// 테스트용 카카오톡 알림 전송 (관리자용)
router.post('/test/kakao-notification', async (req, res) => {
  try {
    const testInquiryData = {
      manager_name: '테스트 고객',
      phone_number: '010-1234-5678',
      manager_address: '서울시 강남구',
      product_type: '청소로봇',
      consultation_contents: '테스트 문의입니다.'
    };

    console.log('🧪 테스트 카카오톡 알림 전송 시작...');
    const result = await hiWorksClient.notifyAllEmployeesNewInquiry(testInquiryData);
    
    res.json({
      success: result.success,
      message: result.message,
      details: result
    });
  } catch (error) {
    console.error('테스트 카카오톡 알림 전송 중 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: `테스트 알림 전송 실패: ${error.message}` 
    });
  }
});

// 메일 발송
router.post('/send-mail', async (req, res) => {
  try {
    const {
      recipient_email,
      cc_email,
      bcc_email,
      subject,
      content
    } = req.body;

    // 필수 필드 검증
    if (!recipient_email || !subject || !content) {
      return res.status(400).json({
        error: 'Missing required fields: recipient_email, subject, content'
      });
    }

    // 발신자 IP 주소 추출
    const senderIp = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     '0.0.0.0';

    console.log(`📧 메일 발송 요청 - 수신자: ${recipient_email}, 발신자IP: ${senderIp}`);

    // 메일 데이터 준비
    const mailData = {
      to: recipient_email,
      cc: cc_email || '',
      bcc: bcc_email || '',
      subject: subject,
      content: content
    };

    // 메일 발송
    const result = await hiWorksClient.sendMail(mailData, senderIp, db);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        logId: result.logId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        remainingTime: result.remainingTime,
        canSend: result.canSend
      });
    }
  } catch (error) {
    console.error('❌ 메일 발송 중 오류:', error);
    res.status(500).json({ 
      error: 'Failed to send mail',
      details: error.message 
    });
  }
});

// 메일 발송 가능 여부 확인
router.get('/mail-status', async (req, res) => {
  try {
    // 발신자 IP 주소 추출
    const senderIp = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     '0.0.0.0';

    const { canSend, remainingTime } = await hiWorksClient.canSendMail(senderIp, db);

    res.json({
      canSend,
      remainingTime,
      cooldownMinutes: parseInt(process.env.MAIL_SEND_COOLDOWN_MINUTES || '10'),
      senderIp
    });
  } catch (error) {
    console.error('메일 상태 확인 중 오류:', error);
    res.status(500).json({ 
      error: 'Failed to check mail status',
      details: error.message 
    });
  }
});

// 메일 발송 기록 조회 (관리자용)
router.get('/mail-logs', async (req, res) => {
  try {
    const query = `
      SELECT * FROM mail_log 
      ORDER BY created_at DESC 
      LIMIT 100
    `;
    const results = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('메일 로그 조회 실패:', error);
    res.status(500).json({ 
      error: 'Failed to fetch mail logs',
      details: error.message 
    });
  }
});

// 특정 IP의 메일 발송 기록 조회
router.get('/mail-logs/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const query = `
      SELECT * FROM mail_log 
      WHERE sender_ip = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    const results = await db.query(query, [ip]);
    res.json(results);
  } catch (error) {
    console.error('메일 로그 조회 실패:', error);
    res.status(500).json({ 
      error: 'Failed to fetch mail logs',
      details: error.message 
    });
  }
});

module.exports = router;
