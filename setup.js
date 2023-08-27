import { launch } from 'puppeteer';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DIR = join(tmpdir(), 'jest_puppeteer_global_setup');

export default async function() {
  const browser = await launch({
    executablePath:
      '/Applications/Safari.app',
    headless: 'new'
  });
  global.__BROWSER_GLOBAL__ = browser;
  if (!existsSync(DIR)) mkdirSync(DIR);
  writeFileSync(join(DIR, 'wsEndpoint'), browser.wsEndpoint());
}
