/**
 * Serve static export on 0.0.0.0:$PORT for Render.
 */
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'out');
const serveBin = join(root, 'node_modules', '.bin', 'serve');
const port = process.env.PORT || '3000';
const host = '0.0.0.0';

if (!existsSync(join(outDir, 'index.html'))) {
  console.error('ERROR: out/index.html not found. Run npm run build first.');
  process.exit(1);
}

if (!existsSync(serveBin)) {
  console.error('ERROR: serve not installed. Run npm ci first.');
  process.exit(1);
}

console.log(`Serving static site on ${host}:${port}`);

const child = spawn(
  serveBin,
  [outDir, '-l', `tcp://${host}:${port}`, '--no-clipboard', '--no-port-switching'],
  { stdio: 'inherit', env: process.env },
);

child.on('exit', (code) => process.exit(code ?? 1));
