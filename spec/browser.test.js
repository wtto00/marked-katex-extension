import { resolve } from 'node:path';
import { snapshots, normalize, normalizeSnapshotHtml } from './util.js';
import { readFileSync } from 'node:fs';
import 'jest-specific-snapshot';

const timeout = 5000;
const snapshotNames = Object.keys(snapshots).map((s, i) => ({ index: i, name: s }));
const specs = JSON.parse(readFileSync('./spec/specs.json')); // fix when cwd is not root

const hasOnly = specs.some(s => s.only);
const specsList = specs.filter(s => !hasOnly || s.only).map((s, i) => ({ ...s, index: i }));

function getHtmlContent() {
  let html = '<div id="main"></div><div id="spec"></div>';
  html += `<script>
  const snapshots = ${JSON.stringify(snapshots)};
  const snapshotNames = ${JSON.stringify(snapshotNames.map(s => s.name))};
  marked.setOptions(marked.getDefaults());
  marked.use(markedKatex());
  const html = snapshotNames.map((name) => \`<div class="marked-katex">\${marked.marked(snapshots[name])}</div>\`).join('');
  document.querySelector('#main').innerHTML = html;

  const specsList = ${JSON.stringify(specsList.map(s => ({ options: s.options, source: s.source, skip: s.skip })))};
  let specHtml = '';
  specsList.forEach(s => {
    marked.use(markedKatex(s.options));
    const delimiter = s.options.displayMode ? '$$' : '$';
    const multiline = s.source.includes('\\n');
    const md = multiline ? \`\${delimiter}\\n\${s.source}\\n\${delimiter}\` : \`\${delimiter} \${s.source} \${delimiter}\`;
    specHtml += \`<div class="marked-katex-spec">\${s.skip ? '' : marked.marked(md)}</div>\`
  });
  document.querySelector('#spec').innerHTML = specHtml;
</script>`;
  return html;
}

describe(
  'marked-katex-extension',
  () => {
    beforeAll(async() => {
      await page.addStyleTag({ path: resolve('.', 'node_modules/katex/dist/katex.min.css') });
      await page.addScriptTag({ path: resolve('.', 'node_modules/marked/lib/marked.umd.js') });
      await page.addScriptTag({ path: resolve('.', 'lib/index.umd.js') });

      await page.setContent(getHtmlContent());
    });

    test.each(snapshotNames)('$name', async({ index }) => {
      const html = await page.evaluate((i) => document.querySelectorAll('.marked-katex').item(i).innerHTML, index);
      expect(normalizeSnapshotHtml(html)).toMatchSpecificSnapshot('__snapshots__/index.test.js.snap');
    }, timeout);

    describe('spec', () => {
      for (let index = 0; index < specsList.length; index++) {
        const specItem = specsList[index];
        const testFunc = specItem.only ? test.only : specItem.skip ? test.skip : test;
        testFunc(`Specs: ${specItem.name}`, async() => {
          const html = await page.evaluate((i) => document.querySelectorAll('.marked-katex-spec').item(i).innerHTML, index);
          const specItem = specsList[index];
          const multiline = specItem.source.includes('\n');
          const expected = multiline ? specItem.rendered : `<p>${specItem.rendered}</p>`;
          // eslint-disable-next-line jest/no-standalone-expect
          expect(normalize(html)).toBe(normalize(expected));
        }, timeout);
      }
    });
  });
