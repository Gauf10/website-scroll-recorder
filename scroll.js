const { chromium } = require('playwright');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// -----------------------------------
// HELPERS
// -----------------------------------

function ask(question) {

  return new Promise(resolve => {

    rl.question(question, answer => {
      resolve(answer.trim());
    });

  });

}

function exitProgram() {

  console.log('\nProceso cancelado.\n');

  rl.close();

  process.exit(0);

}

async function askWithValidation(
  question,
  validationFn,
  errorMessage
) {

  while (true) {

    const answer = await ask(question);

    if (
      answer.toLowerCase() === 'q' ||
      answer.toLowerCase() === 'exit'
    ) {

      exitProgram();

    }

    if (validationFn(answer)) {

      return answer;

    }

    console.log(`\n❌ ${errorMessage}\n`);

  }

}

async function waitForFileStable(filePath) {

  let lastSize = -1;

  for (let i = 0; i < 20; i++) {

    if (fs.existsSync(filePath)) {

      const stats = fs.statSync(filePath);

      const currentSize = stats.size;

      if (
        currentSize > 0 &&
        currentSize === lastSize
      ) {

        return;

      }

      lastSize = currentSize;

    }

    await new Promise(resolve =>
      setTimeout(resolve, 500)
    );

  }

  throw new Error(
    'El archivo de video no terminó de generarse.'
  );

}

function sanitizeFileName(name) {

  return name
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')
    .replace(/[^\w\-]/g, '_');

}

function getDateString() {

  const now = new Date();

  const year = now.getFullYear();

  const month =
    String(now.getMonth() + 1).padStart(2, '0');

  const day =
    String(now.getDate()).padStart(2, '0');

  const hour =
    String(now.getHours()).padStart(2, '0');

  const minute =
    String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}_${hour}-${minute}`;

}

// -----------------------------------
// MAIN
// -----------------------------------

(async () => {

  console.log('\nEscribí "q" para cancelar.\n');

  // -----------------------------------
  // URL
  // -----------------------------------

  let url = await askWithValidation(

    'URL a grabar: ',

    value => value.length >= 3,

    'Ingresá una URL válida.'

  );

  if (
    !url.startsWith('http://') &&
    !url.startsWith('https://')
  ) {

    url = 'https://' + url;

  }

  // -----------------------------------
  // DEVICE
  // -----------------------------------

  const deviceChoice =
    await askWithValidation(

      '\nDispositivo:\n1.Mobile\n2.Tablet\n3.Desktop\n\nElegí opción: ',

      value => ['1', '2', '3'].includes(value),

      'Elegí 1, 2 o 3.'

    );

  let deviceName = 'mobile';

  if (deviceChoice === '2') deviceName = 'tablet';
  if (deviceChoice === '3') deviceName = 'desktop';

  // -----------------------------------
  // SPEED
  // -----------------------------------

  const speedChoice =
    await askWithValidation(

      '\nVelocidad:\n1.Lento elegante\n2.Estándar\n3.Rápido\n4.Ultra rápido\n\nElegí opción: ',

      value => ['1', '2', '3', '4'].includes(value),

      'Elegí 1, 2, 3 o 4.'

    );

  let speed = 6;

  if (speedChoice === '1') speed = 4;
  if (speedChoice === '2') speed = 6;
  if (speedChoice === '3') speed = 10;
  if (speedChoice === '4') speed = 16;

  // -----------------------------------
  // FORMAT
  // -----------------------------------

  const format =
    await askWithValidation(

      '\nFormato:\n1.webm\n2.mp4\n3.gif\n\nElegí opción: ',

      value => ['1', '2', '3'].includes(value),

      'Elegí 1, 2 o 3.'

    );

  rl.close();

  // -----------------------------------
  // DEVICE CONFIG
  // -----------------------------------

  let config;
  let videoSize;

  if (deviceChoice === '2') {

    config = {

      viewport: {
        width: 834,
        height: 1194
      },

      deviceScaleFactor: 1,

      isMobile: true,

      hasTouch: true

    };

    videoSize = {
      width: 834,
      height: 1194
    };

  }

  else if (deviceChoice === '3') {

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

  }

  else {

    config = {

      viewport: {
        width: 430,
        height: 932
      },

      deviceScaleFactor: 1,

      isMobile: true,

      hasTouch: true

    };

    videoSize = {
      width: 430,
      height: 932
    };

  }

  // -----------------------------------
  // FFMPEG
  // -----------------------------------

  let ffmpegPath = 'ffmpeg';

  const localPaths = [

    './ffmpeg.exe',

    './ffmpeg/ffmpeg.exe',

    './ffmpeg/bin/ffmpeg.exe'

  ];

  for (const testPath of localPaths) {

    if (fs.existsSync(testPath)) {

      ffmpegPath = testPath;

      break;

    }

  }

  console.log('\nFFmpeg encontrado en:', ffmpegPath);

  // -----------------------------------
  // START
  // -----------------------------------

  try {

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

      waitUntil: 'domcontentloaded',

      timeout: 30000

    });

    // esperar carga completa

    await page.waitForLoadState('networkidle');

    // ocultar cursor custom

    await page.addStyleTag({

      content: `

        * {
          cursor: default !important;
        }

        .cursor,
        .custom-cursor,
        .cursor-dot,
        .cursor-outline {
          opacity: 0 !important;
          display: none !important;
        }

      `

    });

    // esperar fonts

    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // esperar render estable

    console.log('Esperando render estable...\n');

    let initialWait = 2500;

    if (speedChoice === '3') {
      initialWait = 3500;
    }

    if (speedChoice === '4') {
      initialWait = 4500;
    }

    await page.waitForTimeout(initialWait);

    // -----------------------------------
    // SCROLL
    // -----------------------------------

    console.log('Grabando scrolling...\n');

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

    // pausa final

    await page.waitForTimeout(1200);

    console.log('Finalizando video...\n');

    await browser.close();

    // -----------------------------------
    // FIND VIDEO
    // -----------------------------------

    const files =
      fs.readdirSync('./videos');

    const webmFile =
      files
        .filter(file => file.endsWith('.webm'))
        .sort((a, b) => {

          return fs.statSync(
            path.join('./videos', b)
          ).mtimeMs -

          fs.statSync(
            path.join('./videos', a)
          ).mtimeMs;

        })[0];

    const inputPath =
      path.join('./videos', webmFile);

    console.log('Esperando exportación final del video...\n');

    await waitForFileStable(inputPath);

    // -----------------------------------
    // FILE NAME
    // -----------------------------------

    const safeUrl =
      sanitizeFileName(url);

    const dateString =
      getDateString();

    const finalBaseName =
      `${safeUrl}_${deviceName}_${dateString}`;

    const outputBase =
      path.join(
        './videos',
        finalBaseName
      );

    // -----------------------------------
    // PROCESSING
    // -----------------------------------

    const needsTrim =
      speedChoice === '3' ||
      speedChoice === '4';

    const trimSeconds =
      speedChoice === '4'
        ? 1
        : 0.6;

    const cleanedWebm =
      `${outputBase}.webm`;

    // -----------------------------------
    // WEBM DIRECTO
    // -----------------------------------

    if (
      format === '1' &&
      !needsTrim
    ) {

      console.log('Renombrando video...\n');

      fs.renameSync(
        inputPath,
        cleanedWebm
      );

    }

    // -----------------------------------
    // WEBM CON TRIM
    // -----------------------------------

    else {

      console.log('Procesando video...\n');

      execSync(

        `"${ffmpegPath}" -y -ss ${trimSeconds} -i "${inputPath}" -vf "fade=t=in:st=0:d=0.2" -c:v libvpx-vp9 "${cleanedWebm}"`,

        { stdio: 'inherit' }

      );

      // borrar original

      if (fs.existsSync(inputPath)) {

        fs.unlinkSync(inputPath);

      }

    }

    // -----------------------------------
    // MP4
    // -----------------------------------

    if (format === '2') {

      console.log('Convirtiendo a MP4...\n');

      execSync(

        `"${ffmpegPath}" -y -i "${cleanedWebm}" -c:v libx264 "${outputBase}.mp4"`,

        { stdio: 'inherit' }

      );

    }

    // -----------------------------------
    // GIF
    // -----------------------------------

    if (format === '3') {

      console.log('Convirtiendo a GIF...\n');

      execSync(

        `"${ffmpegPath}" -y -i "${cleanedWebm}" "${outputBase}.gif"`,

        { stdio: 'inherit' }

      );

    }

    console.log('\n================================');
    console.log('VIDEO GENERADO EN /videos');
    console.log('================================\n');

  }

  catch (error) {

    console.log('\n================================');
    console.log('❌ ERROR');
    console.log('================================\n');

    console.log(error.message);

    console.log('\nVerificá:');
    console.log('- URL correcta');
    console.log('- conexión');
    console.log('- FFmpeg');
    console.log('- que la web exista\n');

  }

})();