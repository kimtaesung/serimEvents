const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database/db-adapter');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password required' 
      });
    }

    let isValidUser = false;
    let user = null;
    let isInitialized = true;

    try {
      // Try database first
      const [results] = await db.query(
        'SELECT id, username, email, password_hash, is_initialized FROM admin_users WHERE username = ?',
        [username]
      );

      if (results && results.length > 0) {
        const dbUser = results[0];
        isValidUser = await bcrypt.compare(password, dbUser.password_hash);
        if (isValidUser) {
          user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email
          };
          isInitialized = dbUser.is_initialized;
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Fallback for development
      if (NODE_ENV === 'development') {
        console.log('Using fallback authentication');
        if (username === 'admin' && password === 'admin123') {
          isValidUser = true;
          user = {
            id: 1,
            username: 'admin',
            email: 'admin@dev.com'
          };
        }
      }
    }

    if (!isValidUser) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    try {
      await db.query(
        'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );
    } catch (error) {
      console.error('Error updating last_login:', error);
    }

    res.json({
      success: true,
      token,
      user,
      isInitialized,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

/**
 * GET /api/auth/check-init
 * 관리자 계정 초기화 상태 확인
 */
router.get('/check-init', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT id, username, is_initialized FROM admin_users WHERE username = ?',
      ['admin']
    );

    if (!results || results.length === 0) {
      return res.json({
        success: true,
        exists: false,
        isInitialized: false
      });
    }

    const admin = results[0];
    res.json({
      success: true,
      exists: true,
      isInitialized: admin.is_initialized,
      username: admin.username
    });
  } catch (error) {
    console.error('Check init error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check initialization status' 
    });
  }
});

/**
 * POST /api/auth/setup-password
 * 최초 관리자 패스워드 설정
 */
router.post('/setup-password', async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // 입력 검증
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password fields are required' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    try {
      // 관리자 계정 확인
      const [results] = await db.query(
        'SELECT id, is_initialized FROM admin_users WHERE username = ?',
        ['admin']
      );

      if (!results || results.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Admin user not found' 
        });
      }

      const admin = results[0];

      // 이미 초기화되었으면 거부
      if (admin.is_initialized) {
        return res.status(400).json({ 
          success: false, 
          message: 'Admin account already initialized' 
        });
      }

      // 새 비밀번호 해시 생성
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // 데이터베이스 업데이트
      await db.query(
        'UPDATE admin_users SET password_hash = ?, is_initialized = ? WHERE id = ?',
        [passwordHash, true, admin.id]
      );

      res.json({
        success: true,
        message: 'Admin password set successfully'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to set password' 
      });
    }
  } catch (error) {
    console.error('Setup password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Setup failed' 
    });
  }
});

/**
 * GET /api/auth/check-init
 * 관리자 계정 초기화 상태 확인
 */
router.get('/check-init', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT id, username, is_initialized FROM admin_users WHERE username = ?',
      ['admin']
    );

    if (!results || results.length === 0) {
      return res.json({
        success: true,
        exists: false,
        isInitialized: false
      });
    }

    const admin = results[0];
    res.json({
      success: true,
      exists: true,
      isInitialized: admin.is_initialized,
      username: admin.username
    });
  } catch (error) {
    console.error('Check init error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check initialization status' 
    });
  }
});

/**
 * POST /api/auth/setup-password
 * 최초 관리자 패스워드 설정
 */
router.post('/setup-password', async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // 입력 검증
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password fields are required' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    try {
      // 관리자 계정 확인
      const [results] = await db.query(
        'SELECT id, is_initialized FROM admin_users WHERE username = ?',
        ['admin']
      );

      if (!results || results.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Admin user not found' 
        });
      }

      const admin = results[0];

      // 이미 초기화되었으면 거부
      if (admin.is_initialized) {
        return res.status(400).json({ 
          success: false, 
          message: 'Admin account already initialized' 
        });
      }

      // 새 비밀번호 해시 생성
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // 데이터베이스 업데이트
      await db.query(
        'UPDATE admin_users SET password_hash = ?, is_initialized = ? WHERE id = ?',
        [passwordHash, true, admin.id]
      );

      res.json({
        success: true,
        message: 'Admin password set successfully'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to set password' 
      });
    }
  } catch (error) {
    console.error('Setup password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Setup failed' 
    });
  }
});

/**
 * POST /api/auth/verify
 */
router.post('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

/**
 * POST /api/auth/change-password
 * 관리자 패스워드 변경
 */
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    // 토큰 검증
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    // 입력 검증
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New passwords do not match' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // 현재 비밀번호 검증
    try {
      const [results] = await db.query(
        'SELECT id, password_hash FROM admin_users WHERE id = ?',
        [userId]
      );

      if (!results || results.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const user = results[0];
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password_hash);

      if (!isPasswordCorrect) {
        return res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }

      // 새 비밀번호 해시 생성
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // 데이터베이스 업데이트
      await db.query(
        'UPDATE admin_users SET password_hash = ? WHERE id = ?',
        [newPasswordHash, userId]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update password' 
      });
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Password change failed' 
    });
  }
});

module.exports = router;
