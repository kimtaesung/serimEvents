const express = require('express');
const router = express.Router();
const db = require('../database/db-adapter');

// GET 모든 카테고리 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, category_index, category_name, description, display_order, is_active FROM categories ORDER BY display_order, category_index'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET 특정 카테고리 조회
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// POST 카테고리 생성
router.post('/', async (req, res) => {
  try {
    const { categoryIndex, categoryName, description, displayOrder, isActive } = req.body;
    
    if (!categoryIndex || !categoryName) {
      return res.status(400).json({ error: 'categoryIndex and categoryName are required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO categories (category_index, category_name, description, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [categoryIndex, categoryName, description || null, displayOrder || 0, isActive !== false]
    );
    
    res.json({ 
      id: result.insertId, 
      message: 'Category created successfully' 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category index already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT 카테고리 업데이트
router.put('/:id', async (req, res) => {
  try {
    const { categoryIndex, categoryName, description, displayOrder, isActive } = req.body;
    
    const [result] = await db.query(
      'UPDATE categories SET category_index = ?, category_name = ?, description = ?, display_order = ?, is_active = ? WHERE id = ?',
      [categoryIndex, categoryName, description || null, displayOrder || 0, isActive !== false, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category index already exists' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE 카테고리 삭제
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
