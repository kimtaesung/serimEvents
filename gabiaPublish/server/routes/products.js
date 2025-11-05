const express = require('express');
const router = express.Router();
const db = require('../database/db-adapter');

// GET 모든 상품 조회
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    let query = 'SELECT id, category_id, product_name, description, price, image_url, display_order, is_active, features FROM products';
    let params = [];
    
    if (categoryId) {
      query += ' WHERE category_id = ?';
      params.push(categoryId);
    }
    
    query += ' ORDER BY display_order, id';
    
    const [rows] = await db.query(query, params);
    
    // features JSON 파싱 (오류 처리 포함) 및 필드 이름 정규화
    const products = rows.map(product => {
      let features = [];
      if (product.features) {
        try {
          features = JSON.parse(product.features);
        } catch (e) {
          features = typeof product.features === 'string' 
            ? [product.features] 
            : [];
        }
      }
      
      // DB 필드를 클라이언트 필드로 변환
      return {
        id: product.id,
        name: product.product_name,
        description: product.description,
        price: product.price,
        image: product.image_url,
        images: [],
        category: product.category_id,
        features,
        isActive: product.is_active,
        display_order: product.display_order
      };
    });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET 특정 상품 조회
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = rows[0];
    let features = [];
    if (product.features) {
      try {
        features = JSON.parse(product.features);
      } catch (e) {
        features = typeof product.features === 'string' 
          ? [product.features] 
          : [];
      }
    }
    
    // DB 필드를 클라이언트 필드로 변환
    const result = {
      id: product.id,
      name: product.product_name,
      description: product.description,
      price: product.price,
      image: product.image_url,
      images: [],
      category: product.category_id,
      features,
      isActive: product.is_active,
      display_order: product.display_order
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST 상품 생성
router.post('/', async (req, res) => {
  try {
    // 클라이언트에서 보낼 수 있는 필드명들 모두 지원
    const { 
      name, productName,           // 상품명
      category, categoryId,        // 카테고리
      description,                 // 설명
      price,                       // 가격 (선택사항)
      image, imageUrl,             // 이미지 URL
      features,                    // 특징
      inStock, isActive            // 재고/활성화
    } = req.body;
    
    // 필드명 정규화
    const finalProductName = name || productName;
    const finalCategory = category || categoryId;
    const finalPrice = price ? Number(price) : null;
    const finalImageUrl = image || imageUrl || null;
    const finalFeatures = features ? JSON.stringify(features) : null;
    const finalIsActive = inStock !== undefined ? inStock : (isActive !== false);
    
    if (!finalProductName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO products (category_id, product_name, description, price, image_url, display_order, is_active, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        finalCategory || null,
        finalProductName,
        description || null,
        finalPrice,
        finalImageUrl,
        0,
        finalIsActive,
        finalFeatures
      ]
    );
    
    res.json({ 
      id: result.insertId,
      name: finalProductName,
      description: description || null,
      price: finalPrice,
      image: finalImageUrl,
      images: [],
      category: finalCategory || null,
      features: features || [],
      isActive: finalIsActive,
      message: 'Product created successfully' 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// PUT 상품 업데이트
router.put('/:id', async (req, res) => {
  try {
    const {
      name, productName,           // 상품명
      category, categoryId,        // 카테고리
      description,                 // 설명
      price,                       // 가격 (선택사항)
      image, imageUrl,             // 이미지 URL
      features,                    // 특징
      inStock, isActive            // 재고/활성화
    } = req.body;
    
    // 필드명 정규화
    const finalProductName = name || productName;
    const finalCategory = category || categoryId;
    const finalPrice = price ? Number(price) : null;
    const finalImageUrl = image || imageUrl || null;
    const finalFeatures = features ? JSON.stringify(features) : null;
    const finalIsActive = inStock !== undefined ? inStock : (isActive !== false);
    
    if (!finalProductName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    const [result] = await db.query(
      'UPDATE products SET category_id = ?, product_name = ?, description = ?, price = ?, image_url = ?, is_active = ?, features = ? WHERE id = ?',
      [
        finalCategory || null,
        finalProductName,
        description || null,
        finalPrice,
        finalImageUrl,
        finalIsActive,
        finalFeatures,
        req.params.id
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

// DELETE 상품 삭제
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
