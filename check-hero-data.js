#!/usr/bin/env node

const db = require('./server/database/connection');

async function checkHeroData() {
  try {
    console.log('\n===== Checking Hero Data in Database =====\n');
    
    // 1. 모든 섹션 확인
    console.log('1. All sections:');
    const [allSections] = await db.query('SELECT id, section_type, title, is_active, images FROM sections');
    console.log(JSON.stringify(allSections, null, 2));
    
    // 2. Hero 섹션만 확인
    console.log('\n2. Hero sections:');
    const [heroSections] = await db.query('SELECT * FROM sections WHERE section_type = ?', ['hero']);
    console.log(JSON.stringify(heroSections, null, 2));
    
    // 3. images 컬럼 확인
    if (heroSections.length > 0) {
      console.log('\n3. Hero images field:');
      console.log('Raw images:', heroSections[0].images);
      console.log('Parsed images:', heroSections[0].images ? JSON.parse(heroSections[0].images) : 'null');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkHeroData();
