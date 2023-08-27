import { marked } from 'marked';
import markedKatex from '../src/index.js';
import { readFileSync } from 'node:fs';
import { normalize, snapshots } from './util.js';

const specs = JSON.parse(readFileSync('./spec/specs.json')); // fix when cwd is not root

describe('marked-katex-extension', () => {
  beforeEach(() => {
    marked.setOptions(marked.getDefaults());
  });

  for (const name in snapshots) {
    test(name, () => {
      marked.use(markedKatex());
      const md = snapshots[name];
      expect(marked(md)).toMatchSnapshot();
    });
  }

  describe('specs', () => {
    const hasOnly = specs.some(s => s.only);
    for (const s of specs) {
      if (hasOnly && !s.only) {
        continue;
      }
      (s.only ? test.only : (s.skip ? test.skip : test))(`Specs: ${s.name}`, () => {
        marked.use(markedKatex(s.options));
        const delimiter = s.options.displayMode ? '$$' : '$';
        const multiline = s.source.includes('\n');
        const md = multiline ? `${delimiter}\n${s.source}\n${delimiter}` : `${delimiter} ${s.source} ${delimiter}`;
        const expected = multiline ? s.rendered : `<p>${s.rendered}</p>\n`;
        expect(normalize(marked(md))).toBe(normalize(expected));
      });
    }
  });
});
