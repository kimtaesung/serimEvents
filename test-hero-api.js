#!/usr/bin/env node

const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8007,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function test() {
  try {
    console.log('\n===== Testing Hero API =====\n');
    console.log('Connecting to http://localhost:8007...\n');
    
    console.log('1. Testing GET /api/sections?type=hero');
    const result = await makeRequest('/api/sections?type=hero');
    console.log('Status:', result.status);
    console.log('Response:', JSON.parse(result.data));
    
    console.log('\n2. Testing all sections');
    const allResult = await makeRequest('/api/sections');
    const allSections = JSON.parse(allResult.data);
    console.log('Total sections:', allSections.length);
    allSections.forEach(s => {
      console.log(`- ID: ${s.id}, Type: ${s.section_type}, Active: ${s.is_active}, Images: ${s.images ? 'yes' : 'no'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
  process.exit(0);
}

test();
