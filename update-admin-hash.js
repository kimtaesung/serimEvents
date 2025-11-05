const mysql = require('mysql2/promise');

const hash = '$2a$10$bhoOpkPYyR53mqeRYtDsTuDbtirBN6hfdO51enldiR6kOPRoM.sgy';

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'serim!123',
      database: 'serimrobo'
    });

    console.log('Connected to database');
    
    const [result] = await connection.execute(
      'UPDATE admin_users SET password_hash = ? WHERE username = ?',
      [hash, 'admin']
    );
    
    console.log('Update result:', result);
    
    const [rows] = await connection.execute(
      'SELECT username, password_hash FROM admin_users WHERE username = ?',
      ['admin']
    );
    
    console.log('Verify - Current password_hash:', rows[0]?.password_hash);
    
    connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
