const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 가비아 호스팅 환경 - uploads 디렉토리 경로 수정
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    let prefix = 'img-';
    
    if (file.mimetype.startsWith('video/')) {
      prefix = 'video-';
    } else if (ext === '.glb' || ext === '.gltf') {
      prefix = '3d-';
    }
    
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // 이미지, 동영상 및 3D 파일 허용
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|mp4|webm|mov|avi|glb|gltf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype.startsWith('video/') || 
                   file.mimetype === 'model/gltf-binary' ||
                   file.mimetype === 'application/octet-stream'; // GLB 파일의 일반적인 MIME type

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image, video, and 3D model files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB 제한 (영상 파일을 위해 증가)
  fileFilter: fileFilter
});

// POST: 이미지 업로드
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// DELETE: 이미지 삭제 (관리자 전용)
router.delete('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'File deletion failed' });
  }
});

module.exports = router;
