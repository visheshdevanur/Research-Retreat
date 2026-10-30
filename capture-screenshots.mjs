import puppeteer from 'puppeteer';
import path from 'path';

async function captureScreenshots() {
  const outDir = 'C:\\Users\\Vishesh G Devanur\\.gemini\\antigravity\\brain\\807fb2be-99b4-4446-8ce2-3102c2cb040a';

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--window-size=1920,1080',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 3500));

  // 1. Capture Main Dormant Stage (Phase A)
  await page.screenshot({ path: path.join(outDir, 'screenshot_phase_a_main.png') });
  console.log('✓ Captured Phase A Main Stage');

  // 2. Open Operator Console (Ctrl + Shift + P)
  await page.keyboard.down('Control');
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyP');
  await page.keyboard.up('Shift');
  await page.keyboard.up('Control');
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'screenshot_operator_console.png') });
  console.log('✓ Captured Operator Console');
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 600));

  // 3. Trigger Ceremony via Spacebar
  await page.keyboard.press('Space');
  await new Promise((r) => setTimeout(r, 1000));

  // Wait for Blast to complete and transition directly to VIDEO_01
  await new Promise((r) => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(outDir, 'screenshot_video_01.png') });
  console.log('✓ Captured Video 01 Presentation');

  // Dispatch ended event on Video 01
  await page.evaluate(() => {
    const v = document.querySelector('video[src*="video-01.mp4"]');
    if (v) v.dispatchEvent(new Event('ended'));
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'screenshot_video_02.png') });
  console.log('✓ Captured Video 02 Presentation');

  // Dispatch ended event on Video 02 -> Advances directly to Phase F Final Screen
  await page.evaluate(() => {
    const v = document.querySelector('video[src*="video-02.mp4"]');
    if (v) v.dispatchEvent(new Event('ended'));
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'screenshot_phase_f_final.png') });
  console.log('✓ Captured Phase F Final Inauguration Screen');

  await browser.close();
  console.log('All screenshots captured successfully.');
}

captureScreenshots().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
