const { chromium } = require('playwright');

async function runComprehensiveTest() {
  console.log('🚀 Starting comprehensive test of Versatify website at http://localhost:5173');
  console.log('=' .repeat(80));

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Test 1: Homepage Load and Elements
    console.log('\n📄 TEST 1: Homepage Load and Basic Elements');
    console.log('-'.repeat(50));
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Check if main Versatify heading is visible
    try {
      const versatifyHeading = await page.locator('h1').filter({ hasText: 'Versatify' }).first();
      if (await versatifyHeading.isVisible()) {
        console.log('✅ Main Versatify heading is visible');
      } else {
        console.log('❌ Main Versatify heading is not visible');
      }
    } catch (error) {
      console.log('❌ Error checking Versatify heading:', error.message);
    }

    // Check email input field
    try {
      const emailInput = await page.locator('input[type="email"], input[placeholder*="이메일"]').first();
      if (await emailInput.isVisible()) {
        console.log('✅ Email input field is visible');
      } else {
        console.log('❌ Email input field is not visible');
      }
    } catch (error) {
      console.log('❌ Error checking email input:', error.message);
    }

    // Check main CTA button
    try {
      const ctaButton = await page.locator('button[type="submit"], button:has-text("시작하기")').first();
      if (await ctaButton.isVisible()) {
        console.log('✅ Main CTA button is visible');
      } else {
        console.log('❌ Main CTA button is not visible');
      }
    } catch (error) {
      console.log('❌ Error checking CTA button:', error.message);
    }

    // Check login/signup buttons
    try {
      const loginButton = await page.locator('button:has-text("로그인")').first();
      const signupButton = await page.locator('button:has-text("회원가입")').first();
      
      if (await loginButton.isVisible()) {
        console.log('✅ Login button is visible');
      } else {
        console.log('❌ Login button is not visible');
      }
      
      if (await signupButton.isVisible()) {
        console.log('✅ Signup button is visible');
      } else {
        console.log('❌ Signup button is not visible');
      }
    } catch (error) {
      console.log('❌ Error checking login/signup buttons:', error.message);
    }

    // Test 2: Main Navigation and CTA Functionality
    console.log('\n🎯 TEST 2: Main Navigation and CTA Functionality');
    console.log('-'.repeat(50));

    // Try clicking the main form submit button (시작하기)
    try {
      const emailInput = await page.locator('input[placeholder*="이메일"]').first();
      const submitButton = await page.locator('button[type="submit"]').first();
      
      await emailInput.fill('test@example.com');
      console.log('✅ Successfully filled email input');
      
      await submitButton.click();
      console.log('✅ Successfully clicked main CTA button');
      
      // Wait for navigation and check if we're on the generate page
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();
      console.log('📍 Current URL after CTA click:', currentUrl);
      
      if (currentUrl.includes('/app/generate') || currentUrl.includes('#/app/generate')) {
        console.log('✅ Successfully navigated to generate page');
      } else {
        console.log('⚠️ Navigation may not have worked as expected');
      }
    } catch (error) {
      console.log('❌ Error testing main CTA:', error.message);
    }

    // Test 3: Generate Page Elements
    console.log('\n⚙️ TEST 3: Generate Page Elements');
    console.log('-'.repeat(50));

    try {
      // Navigate directly to generate page to ensure we're there
      await page.goto('http://localhost:5173/#/app/generate');
      await page.waitForLoadState('networkidle');
      
      // Check for form elements
      const topicInput = await page.locator('input[placeholder*="주제"], label:has-text("주제") + input, input[name*="topic"]').first();
      if (await topicInput.isVisible()) {
        console.log('✅ Topic input field is visible');
        
        // Test filling the topic input
        await topicInput.fill('Test Blog Topic');
        console.log('✅ Successfully filled topic input');
      } else {
        console.log('❌ Topic input field is not visible');
      }

      // Check for generate button
      const generateButton = await page.locator('button:has-text("생성"), button:has-text("초안")').first();
      if (await generateButton.isVisible()) {
        console.log('✅ Generate button is visible');
        
        // Test clicking generate button
        await generateButton.click();
        console.log('✅ Successfully clicked generate button');
      } else {
        console.log('❌ Generate button is not visible');
      }

    } catch (error) {
      console.log('❌ Error testing generate page:', error.message);
    }

    // Test 4: Dashboard Navigation
    console.log('\n🏠 TEST 4: Dashboard Navigation');
    console.log('-'.repeat(50));

    try {
      // Navigate to dashboard
      await page.goto('http://localhost:5173/#/app');
      await page.waitForLoadState('networkidle');
      
      console.log('📍 Navigated to dashboard');
      
      // Check for dashboard cards/buttons
      const dashboardCards = await page.locator('[data-testid*="card"], .card, button:has-text("생성"), button:has-text("내역"), button:has-text("설정")').all();
      console.log(`✅ Found ${dashboardCards.length} dashboard cards/buttons`);
      
      // Test navigation to different pages
      const pages = [
        { path: '#/app/generate', name: 'Generate' },
        { path: '#/app/history', name: 'History' },
        { path: '#/app/settings', name: 'Settings' },
        { path: '#/app/queue', name: 'Queue' }
      ];
      
      for (const pageInfo of pages) {
        try {
          await page.goto(`http://localhost:5173/${pageInfo.path}`);
          await page.waitForLoadState('networkidle');
          console.log(`✅ Successfully navigated to ${pageInfo.name} page`);
        } catch (error) {
          console.log(`❌ Error navigating to ${pageInfo.name} page:`, error.message);
        }
      }
      
    } catch (error) {
      console.log('❌ Error testing dashboard navigation:', error.message);
    }

    // Test 5: Check for Broken Elements
    console.log('\n🔍 TEST 5: Check for Broken Elements');
    console.log('-'.repeat(50));

    try {
      // Go back to homepage
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      
      // Check all buttons for clickability
      const allButtons = await page.locator('button').all();
      console.log(`🔍 Found ${allButtons.length} buttons on homepage`);
      
      for (let i = 0; i < allButtons.length; i++) {
        try {
          const button = allButtons[i];
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();
          const text = await button.textContent() || `Button ${i + 1}`;
          
          if (isVisible && isEnabled) {
            console.log(`✅ Button "${text.trim()}" is clickable`);
          } else {
            console.log(`⚠️ Button "${text.trim()}" is ${!isVisible ? 'not visible' : 'not enabled'}`);
          }
        } catch (error) {
          console.log(`❌ Error checking button ${i + 1}:`, error.message);
        }
      }
      
      // Check all links
      const allLinks = await page.locator('a').all();
      console.log(`🔍 Found ${allLinks.length} links on homepage`);
      
      for (let i = 0; i < allLinks.length; i++) {
        try {
          const link = allLinks[i];
          const isVisible = await link.isVisible();
          const href = await link.getAttribute('href');
          const text = await link.textContent() || `Link ${i + 1}`;
          
          if (isVisible) {
            console.log(`✅ Link "${text.trim()}" is visible (href: ${href})`);
          } else {
            console.log(`⚠️ Link "${text.trim()}" is not visible`);
          }
        } catch (error) {
          console.log(`❌ Error checking link ${i + 1}:`, error.message);
        }
      }
      
    } catch (error) {
      console.log('❌ Error checking for broken elements:', error.message);
    }

    // Test 6: Performance and Load Times
    console.log('\n⚡ TEST 6: Performance Check');
    console.log('-'.repeat(50));

    try {
      const startTime = Date.now();
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      console.log(`⏱️ Page load time: ${loadTime}ms`);
      
      if (loadTime < 3000) {
        console.log('✅ Page loads quickly (< 3 seconds)');
      } else if (loadTime < 5000) {
        console.log('⚠️ Page load is moderate (3-5 seconds)');
      } else {
        console.log('❌ Page load is slow (> 5 seconds)');
      }
      
    } catch (error) {
      console.log('❌ Error checking performance:', error.message);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 Comprehensive test completed!');
    console.log('='.repeat(80));

  } catch (error) {
    console.log('❌ Major error during testing:', error.message);
  } finally {
    await browser.close();
  }
}

runComprehensiveTest().catch(console.error);