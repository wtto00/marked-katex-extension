import NodeEnvironment from 'jest-environment-node';
import { connect } from 'puppeteer';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DIR = join(tmpdir(), 'jest_puppeteer_global_setup');

class PuppeteerEnvironment extends NodeEnvironment.default {
  async setup() {
    await super.setup();
    const wsEndpoint = readFileSync(join(DIR, 'wsEndpoint'), 'utf8');
    if (!wsEndpoint) {
      throw new Error('wsEndpoint not found');
    }
    this.global.__BROWSER__ = await connect({
      browserWSEndpoint: wsEndpoint
    });
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

export default PuppeteerEnvironment;
