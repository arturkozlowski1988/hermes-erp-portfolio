import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = (file) => readFileSync(join(root, file), 'utf8');

const requiredFiles = [
  'index.html',
  'assets/css/styles.css',
  'assets/js/app.js',
  'assets/img/system-architecture.svg',
  'assets/img/social-card.png',
  'assets/img/favicon.svg',
  'assets/img/favicon-192.png',
  'assets/img/favicon-512.png',
  'assets/img/apple-touch-icon.png',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  '.well-known/security.txt',
  '.nojekyll',
];

test('all production assets exist', () => {
  for (const file of requiredFiles) {
    assert.ok(existsSync(join(root, file)), `missing ${file}`);
  }
});

test('page exposes the complete operating story', () => {
  const html = read('index.html');
  const requiredIds = [
    'main', 'hero', 'operating-system', 'workflows', 'mini-apps',
    'tech-worker', 'cron-control', 'knowledge', 'safety', 'about'
  ];
  for (const id of requiredIds) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }

  for (const phrase of [
    '43 aktywne automatyzacje',
    'Draft odpowiedzi',
    'Decision Hub',
    'tech-worker',
    'REPORT.md',
    'Telegram Mini Apps',
    'Human-in-the-loop',
  ]) {
    assert.ok(html.includes(phrase), `missing key copy: ${phrase}`);
  }
});

test('interactive workflow and cron controls are present and accessible', () => {
  const html = read('index.html');
  assert.ok((html.match(/role="tab"/g) || []).length >= 5, 'expected at least five workflow tabs');
  assert.ok((html.match(/data-cron-filter=/g) || []).length >= 6, 'expected cron filters');
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<dialog[^>]+id="english-summary"/);
});

test('three representative Mini Apps are demonstrated', () => {
  const html = read('index.html');
  for (const value of ['email-draft', 'task-proposal', 'emu-notification']) {
    assert.match(html, new RegExp(`data-mini-app=["']${value}["']`), `missing Mini App ${value}`);
  }
});

test('SEO and social metadata are production-ready', () => {
  const html = read('index.html');
  assert.match(html, /<title>[^<]{20,}<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]{80,}"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  assert.match(html, /property="og:image" content="https:\/\/arturkozlowski1988\.github\.io\/hermes-erp-portfolio\/assets\/img\/social-card\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /rel="canonical" href="https:\/\/arturkozlowski1988\.github\.io\/hermes-erp-portfolio\/"/);
  assert.match(html, /<dialog id="english-summary" lang="en"/);
  assert.equal((html.match(/class="device-screen" aria-hidden="true"/g) || []).length, 3);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /rel="manifest" href="manifest\.json"/);
  assert.match(html, /rel="apple-touch-icon"/);
  assert.match(html, /id="incidents"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('CSS includes responsive, focus and reduced-motion treatment', () => {
  const css = read('assets/css/styles.css');
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\([^)]*max-width:\s*760px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /clamp\(/);
  assert.match(css, /\.reveal-ready \[data-reveal\]/);
});

test('JavaScript implements navigation, tabs, cron filtering and dialog', () => {
  const js = read('assets/js/app.js');
  for (const symbol of [
    'setupNavigation', 'setupWorkflowTabs', 'setupCronExplorer',
    'setupEnglishDialog', 'setupRevealAnimations'
  ]) {
    assert.ok(js.includes(symbol), `missing JS module ${symbol}`);
  }
});
