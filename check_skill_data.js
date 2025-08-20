// Check what's being stored in localStorage for skill gap reports
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5000/skill-gap-report/13');
  await page.waitForTimeout(2000);
  
  const localStorageData = await page.evaluate(() => {
    return {
      selectedCandidate: localStorage.getItem('selected-candidate-report'),
      skillGapCandidates: localStorage.getItem('skill-gap-candidates')
    };
  });
  
  console.log('LocalStorage Data:', localStorageData);
  
  await browser.close();
})();
