import puppeteer from 'puppeteer';

async function testVideoPlayback() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Sample video.currentTime every 500ms
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const timeInfo = await page.evaluate(() => {
      const v = document.querySelector('video');
      return {
        currentTime: v?.currentTime,
        paused: v?.paused,
        readyState: v?.readyState,
        srcObject: !!v?.srcObject,
      };
    });
    console.log(`Sample ${i}:`, timeInfo);
  }

  await browser.close();
}

testVideoPlayback();
