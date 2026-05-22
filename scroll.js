const { chromium, devices } = require('playwright');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

(async () => {

  // -----------------------------------
  // INPUTS
  // -----------------------------------

  const url =
    await ask('URL a grabar: ');

  const deviceType =
    await ask('Captura: mobile / tablet / desktop ? ');

  const speed =
    parseInt(await ask('Velocidad scroll (ej 8): '));

  rl.close();

  // -----------------------------------
  // DEVICE CONFIG
  // -----------------------------------

  let config;
  let videoSize;

  if (deviceType.toLowerCase() === 'tablet') {

    config = devices['iPad Pro 11'];

    videoSize = {
      width: 834,
      height: 1194
    };

  } else if (deviceType.toLowerCase() === 'desktop') {

    config = {
      viewport: {
        width: 1440,
        height: 900
      }
    };

    videoSize = {
      width: 1440,
      height: 900
    };

  } else {

    config = devices['iPhone 13 Pro'];

    videoSize = {
      width: 390,
      height: 844
    };

  }

  // -----------------------------------
  // START
  // -----------------------------------

  console.log('\nAbriendo navegador...\n');

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({

    ...config,

    recordVideo: {
      dir: './videos/',
      size: videoSize
    }

  });

  const page = await context.newPage();

  console.log('Entrando al sitio...\n');

  await page.goto(url, {
    waitUntil: 'domcontentloaded'
  });

  // esperar carga completa
  await page.waitForLoadState('networkidle');

  // esperar fonts
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  // tiempo inicial
  await page.waitForTimeout(2500);

  console.log('Grabando scrolling...\n');

  // -----------------------------------
  // SCROLL
  // -----------------------------------

  await page.evaluate(async (speed) => {

    await new Promise((resolve) => {

      const timer = setInterval(() => {

        window.scrollBy(0, speed);

        const scrollBottom =
          window.innerHeight + window.scrollY;

        const pageHeight =
          document.body.scrollHeight;

        if (scrollBottom >= pageHeight - 5) {

          clearInterval(timer);

          resolve();

        }

      }, 8);

    });

  }, speed);

  // tiempo final
  await page.waitForTimeout(2500);

  console.log('Finalizando video...\n');

  await browser.close();

  console.log('================================');
  console.log('VIDEO GENERADO EN /videos');
  console.log('================================\n');

})();