import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');

const testRun = spawnSync(process.execPath, ['--test', 'tests/site.test.mjs'], {
  cwd: root,
  stdio: 'inherit',
});
if (testRun.status !== 0) process.exit(testRun.status ?? 1);

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const entries = [
  'index.html', '.nojekyll', 'robots.txt', 'sitemap.xml', 'manifest.json', '.well-known',
  'README.md', 'LICENSE',
  'assets', 'docs', 'examples', 'diagrams'
];
for (const entry of entries) {
  const source = join(root, entry);
  if (!existsSync(source)) throw new Error(`Build source missing: ${entry}`);
  cpSync(source, join(dist, entry), { recursive: true });
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
if (!htmlFiles.length) throw new Error('Build produced no HTML files');
console.log(`Built ${files.length} files into dist/ (${htmlFiles.length} HTML document${htmlFiles.length === 1 ? '' : 's'}).`);
