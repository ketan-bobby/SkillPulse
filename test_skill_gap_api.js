// Test the skill gap API to see what data is being returned
const fetch = require('node-fetch');

async function testAPI() {
  try {
    // First login as admin
    const loginRes = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Linxadmin123!@#' })
    });
    
    const cookies = loginRes.headers.get('set-cookie');
    
    // Now fetch skill gap report
    const reportRes = await fetch('http://localhost:5000/api/skill-gap-report/13', {
      headers: { 'Cookie': cookies }
    });
    
    const data = await reportRes.json();
    console.log('API Response candidateInfo:', JSON.stringify(data.candidateInfo, null, 2));
    console.log('API Response performanceMetrics:', JSON.stringify(data.performanceMetrics, null, 2));
    console.log('API Response skillGaps:', data.skillGaps?.slice(0, 3));
    console.log('API Response strengthAreas:', data.strengthAreas);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAPI();
