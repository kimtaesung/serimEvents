const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'serim!123',
      database: 'serimrobo'
    });

    const [rows] = await connection.execute(
      'SELECT id, username, password_hash FROM admin_users WHERE username = ?',
      ['admin']
    );
    
    if (!rows || rows.length === 0) {
      console.log('❌ Admin 사용자를 찾을 수 없습니다');
      connection.end();
      return;
    }

    const admin = rows[0];
    console.log('✅ Admin 사용자 찾음:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password Hash: ${admin.password_hash}`);
    
    // 비밀번호 검증
    const password = 'admin123';
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    
    console.log(`\n비밀번호 검증 (${password}):`);
    console.log(`   결과: ${isMatch ? '✅ 일치' : '❌ 불일치'}`);
    
    connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
