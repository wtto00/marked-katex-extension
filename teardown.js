import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rmSync } from 'node:fs';

const DIR = join(tmpdir(), 'jest_puppeteer_global_setup');

export default async function() {
  await global.__BROWSER_GLOBAL__.close();
  rmSync(DIR, { recursive: true, force: true });
}
