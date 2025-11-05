const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST: 관리자 로그인
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log(`🔐 Login attempt for user: ${username}`);

  try {
    const [users] = await db.query(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );

    console.log(`📋 Query result: Found ${users.length} users`);

    if (users.length === 0) {
      console.log(`❌ User '${username}' not found in database`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    console.log(`👤 User found: ${user.username}, ID: ${user.id}`);
    console.log(`🔒 Stored hash: ${user.password_hash.substring(0, 20)}...`);

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`🔑 Password validation: ${isValidPassword}`);

    if (!isValidPassword) {
      console.log(`❌ Invalid password for user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET: 토큰 검증
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

// GET: 모든 섹션 조회 (관리자용 - 비활성화 포함)
router.get('/sections', authenticateToken, async (req, res) => {
  try {
    const [sections] = await db.query(
      'SELECT * FROM sections ORDER BY section_order ASC'
    );

    // 각 섹션에 대해 이미지들과 링크들 조회
    for (let section of sections) {
      // 섹션 이미지들 조회
      const [images] = await db.query(
        'SELECT * FROM section_images WHERE section_id = ? ORDER BY display_order ASC',
        [section.id]
      );
      section.images = images;

      // contact 타입이면 링크들도 조회
      if (section.section_type === 'contact') {
        const [links] = await db.query(
          'SELECT * FROM contact_links WHERE section_id = ? ORDER BY display_order ASC',
          [section.id]
        );
        section.links = links;
      }
    }

    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// POST: 비밀번호 변경
router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const [users] = await db.query(
      'SELECT * FROM admin_users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE admin_users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
