import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const artifactDir = 'artifacts/visual-review';
const baseUrl = 'http://127.0.0.1:4173/universe-explorer/';
const stops = [
  'On the street', 'Above the avenue', 'The city below', 'Above the atmosphere',
  'A continental view', 'Earth from orbit', 'A world of its own', 'Earth and Moon',
  'The inner Solar System', 'The planetary Solar System', 'Beyond Neptune', 'The Oort Cloud',
  'The nearest stars', 'The stellar neighborhood', 'The local galactic region',
];
const browserErrors = [];
await mkdir(artifactDir, { recursive: true });

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'ignore' });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) { ready = true; break; }
    } catch {}
    await delay(200);
  }
  if (!ready) throw new Error('Vite preview did not become ready.');

  browser = await chromium.launch({ headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=swiftshader'] });

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'ipad-portrait', width: 820, height: 1180 },
    { name: 'phone', width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const scenesForViewport = stops;
    page.on('pageerror', (error) => browserErrors.push({ viewport: viewport.name, type: 'pageerror', message: error.message }));
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push({ viewport: viewport.name, type: 'console', message: message.text() });
    });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${artifactDir}/${viewport.name}-01-${stops[0].toLowerCase().replaceAll(' ', '-')}.png`, fullPage: true, timeout: 90000 });
    const hideText = page.getByRole('button', { name: 'Hide explanatory text' });
    if (await hideText.getAttribute('aria-pressed') !== 'true') throw new Error('Explanatory text should be on by default.');
    await hideText.click();
    await page.locator('#scene-meta').waitFor({ state: 'hidden' });
    await page.screenshot({ path: `${artifactDir}/${viewport.name}-text-hidden.png`, fullPage: true, timeout: 90000 });
    await page.getByRole('button', { name: 'Show explanatory text' }).click();
    await page.locator('#scene-meta').waitFor({ state: 'visible' });
    for (let i = 1; i < scenesForViewport.length; i++) {
      await page.getByRole('button', { name: `Go to ${scenesForViewport[i]}` }).click();
      await page.getByRole('heading', { name: scenesForViewport[i] }).waitFor();
      await delay(350);
      await page.screenshot({ path: `${artifactDir}/${viewport.name}-${String(i + 1).padStart(2, '0')}-${scenesForViewport[i].toLowerCase().replaceAll(' ', '-')}.png`, fullPage: true, timeout: 90000 });
    }
    const webgl = await page.locator('#fallback').isHidden();
    await writeFile(`${artifactDir}/${viewport.name}-report.json`, JSON.stringify({
      viewport, webglAvailable: webgl, sceneTitles: scenesForViewport,
      canvasSize: await page.locator('#universe').evaluate((canvas) => ({ width: canvas.clientWidth, height: canvas.clientHeight })),
      panoramaStatus: await page.locator('#universe').getAttribute('data-panorama-status'),
    }, null, 2));
    await context.close();
  }

  const videoContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1,
    recordVideo: { dir: artifactDir, size: { width: 1440, height: 1000 } },
  });
  const videoPage = await videoContext.newPage();
  videoPage.on('pageerror', (error) => browserErrors.push({ viewport: 'transition-video', type: 'pageerror', message: error.message }));
  await videoPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await videoPage.getByRole('button', { name: /Begin ascent/ }).click();
  for (let i = 1; i < stops.length - 1; i++) {
    await videoPage.getByRole('heading', { name: stops[i] }).waitFor({ timeout: 20000 });
    await videoPage.getByRole('button', { name: /Go further/ }).click();
  }
  await videoPage.getByRole('heading', { name: stops[stops.length - 1] }).waitFor({ timeout: 20000 });
  await delay(800);
  await videoPage.getByRole('button', { name: /Return to Earth/ }).click();
  await videoPage.getByRole('heading', { name: stops[0] }).waitFor({ timeout: 20000 });
  await delay(500);
  const video = videoPage.video();
  await videoPage.close();
  await videoContext.close();
  if (video) await writeFile(`${artifactDir}/transition-video-path.txt`, await video.path());

  await writeFile(`${artifactDir}/browser-errors.json`, JSON.stringify(browserErrors, null, 2));
  if (browserErrors.length) throw new Error(`Browser reported ${browserErrors.length} console or page errors; see artifacts.`);
  console.log(`Visual review complete. Screenshots, WebGL reports, and transition video are in ${artifactDir}/.`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
