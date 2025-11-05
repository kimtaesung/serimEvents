const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET: 모든 활성화된 섹션 조회 (순서대로)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM sections WHERE is_active = TRUE';
    const params = [];
    
    if (type) {
      query += ' AND section_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY section_order ASC';
    
    const [sections] = await db.query(query, params);

    // 각 섹션에 대해 이미지들과 링크들 조회
    for (let section of sections) {
      // images JSON 필드 파싱
      if (section.images) {
        try {
          section.images = JSON.parse(section.images);
        } catch (e) {
          section.images = [];
        }
      } else {
        section.images = [];
      }

      // 섹션 이미지들 조회 (추가)
      const [sectionImages] = await db.query(
        'SELECT * FROM section_images WHERE section_id = ? ORDER BY display_order ASC',
        [section.id]
      );
      section.section_images = sectionImages;

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

// GET: 특정 섹션 조회
router.get('/:id', async (req, res) => {
  try {
    const [sections] = await db.query(
      'SELECT * FROM sections WHERE id = ?',
      [req.params.id]
    );
    
    if (sections.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const section = sections[0];

    // images JSON 필드 파싱
    if (section.images) {
      try {
        section.images = JSON.parse(section.images);
      } catch (e) {
        section.images = [];
      }
    } else {
      section.images = [];
    }

    // 섹션 이미지들 조회 (추가)
    const [sectionImages] = await db.query(
      'SELECT * FROM section_images WHERE section_id = ? ORDER BY display_order ASC',
      [req.params.id]
    );
    section.section_images = sectionImages;

    // contact 타입이면 링크들도 조회
    if (section.section_type === 'contact') {
      const [links] = await db.query(
        'SELECT * FROM contact_links WHERE section_id = ? ORDER BY display_order ASC',
        [req.params.id]
      );
      section.links = links;
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// POST: 새 섹션 생성 (관리자 전용)
router.post('/', async (req, res) => {
  const { title, content, image_url, images, section_order, section_type, is_active } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO sections (title, content, image_url, images, section_order, section_type, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title || '', content || '', image_url || null, images ? JSON.stringify(images) : null, section_order || 0, section_type || 'content', is_active !== false]
    );
    
    res.status(201).json({
      message: 'Section created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// PUT: 섹션 수정 (관리자 전용)
router.put('/:id', async (req, res) => {
  const { title, content, image_url, images, section_order, section_type, is_active } = req.body;
  
  try {
    const [result] = await db.query(
      `UPDATE sections 
       SET title = ?, content = ?, image_url = ?, images = ?, section_order = ?, 
           section_type = ?, is_active = ?
       WHERE id = ?`,
      [title || '', content || '', image_url, images ? JSON.stringify(images) : null, section_order, section_type, is_active, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    res.json({ message: 'Section updated successfully' });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// DELETE: 섹션 삭제 (관리자 전용)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM sections WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// POST: Contact 링크 추가
router.post('/:id/links', async (req, res) => {
  const { link_type, link_url, link_text, icon, display_order } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO contact_links (section_id, link_type, link_url, link_text, icon, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, link_type, link_url, link_text, icon || null, display_order || 0]
    );
    
    res.status(201).json({
      message: 'Contact link created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating contact link:', error);
    res.status(500).json({ error: 'Failed to create contact link' });
  }
});

// POST: 섹션에 이미지 추가
router.post('/:id/images', async (req, res) => {
  const { image_url, image_alt, display_order } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO section_images (section_id, image_url, image_alt, display_order) VALUES (?, ?, ?, ?)',
      [req.params.id, image_url, image_alt || '', display_order || 0]
    );
    
    res.json({
      message: 'Image added to section successfully',
      imageId: result.insertId
    });
  } catch (error) {
    console.error('Error adding image to section:', error);
    res.status(500).json({ error: 'Failed to add image to section' });
  }
});

// DELETE: 섹션 이미지 삭제
router.delete('/:sectionId/images/:imageId', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM section_images WHERE id = ? AND section_id = ?',
      [req.params.imageId, req.params.sectionId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// PUT: 섹션 이미지 순서 업데이트
router.put('/:sectionId/images/:imageId', async (req, res) => {
  const { image_alt, display_order } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE section_images SET image_alt = ?, display_order = ? WHERE id = ? AND section_id = ?',
      [image_alt, display_order, req.params.imageId, req.params.sectionId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ message: 'Image updated successfully' });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

module.exports = router;
