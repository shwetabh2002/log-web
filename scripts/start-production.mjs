/**
 * Production start for Render / any host.
 * Binds 0.0.0.0:$PORT — required for Render health checks.
 */
import { cpSync, existsSync, mkdirSync } from 'fs';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const standalone = join(root, '.next', 'standalone');
const serverJs = join(standalone, 'server.js');

process.env.NODE_ENV = 'production';
process.env.HOSTNAME = '0.0.0.0';
if (!process.env.PORT) process.env.PORT = '3000';

if (!existsSync(serverJs)) {
  console.error(
    'ERROR: .next/standalone/server.js not found.\n' +
      'Build must succeed first: npm run build && npm run postbuild',
  );
  process.exit(1);
}

try {
  if (existsSync(join(root, 'public'))) {
    cpSync(join(root, 'public'), join(standalone, 'public'), { recursive: true });
  }
  mkdirSync(join(standalone, '.next'), { recursive: true });
  if (existsSync(join(root, '.next', 'static'))) {
    cpSync(join(root, '.next', 'static'), join(standalone, '.next', 'static'), {
      recursive: true,
    });
  }
} catch (err) {
  console.warn('Asset copy warning:', err instanceof Error ? err.message : err);
}

console.log(`Starting Next.js (production) on ${process.env.HOSTNAME}:${process.env.PORT}`);

const child = spawn('node', ['server.js'], {
  cwd: standalone,
  env: process.env,
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 1));
