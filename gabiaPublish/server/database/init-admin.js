const bcrypt = require('bcryptjs');
const db = require('./connection');
require('dotenv').config();

/**
 * 관리자 계정 초기화
 * admin 계정이 없을 경우 자동으로 생성합니다.
 * 최초 로그인 시 패스워드를 설정하는 플로우를 위해
 * 초기 패스워드는 임시 값으로 설정하고 is_initialized는 false로 유지합니다.
 */
async function initializeAdmin() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@serimrobo.com';

    // 기존 admin 계정 확인
    const existingUsers = await db.query(
      'SELECT id FROM admin_users WHERE username = ?',
      [adminUsername]
    );

    // existingUsers가 배열이므로 직접 길이 확인
    if (existingUsers && existingUsers.length > 0) {
      console.log(`✓ Admin user '${adminUsername}' already exists`);
      return;
    }

    // 임시 비밀번호 해시 생성 (최초 설정 전)
    const tempPassword = 'temp_' + Math.random().toString(36).substring(7);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // 새 admin 계정 생성 (is_initialized: false)
    await db.query(
      'INSERT INTO admin_users (username, password_hash, email, is_initialized) VALUES (?, ?, ?, ?)',
      [adminUsername, passwordHash, adminEmail, false]
    );

    console.log(`✓ Admin user created successfully (not initialized)`);
    console.log(`  Username: ${adminUsername}`);
    console.log(`  Email: ${adminEmail}`);
    console.log(`  ⚠️  Please set password on first login!`);

  } catch (error) {
    // 중복 키 에러는 이미 존재하는 것이므로 무시
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`✓ Admin user already exists (duplicate entry caught)`);
      return;
    }
    console.error('✗ Failed to initialize admin user:', error.message);
    // 관리자 초기화 실패는 치명적이지 않으므로 throw하지 않음
  }
}

module.exports = { initializeAdmin };
