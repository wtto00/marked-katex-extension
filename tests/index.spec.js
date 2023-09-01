import chai from 'chai';
import marked from 'marked';
import { it } from 'mocha';

import { matchSnapshot } from 'chai-karma-snapshot';
import markedKatex from '../src/index';
import { normalize, snapshots } from '../spec/util';
import specs from '../spec/specs.json';

chai.use(matchSnapshot);

const snapshotNames = Object.keys(snapshots);

document.body.innerHTML = '<div id="main"></div><div id="spec"></div>';

marked.setOptions(marked.getDefaults());

marked.use(markedKatex());
const html = snapshotNames.map((name) => `<div class="marked-katex">${marked.marked(snapshots[name])}</div>`).join('');
document.querySelector('#main').innerHTML = html;

const hasOnly = specs.some(s => s.only);
const specsEnable = specs.filter(s => !hasOnly || s.only).map((s, i) => ({ ...s, index: i }));
const specsList = specsEnable;
let specHtml = '';
specsList.forEach(s => {
  marked.use(markedKatex(s.options));
  const delimiter = s.options.displayMode ? '$$' : '$';
  const multiline = s.source.includes('\n');
  const md = multiline ? `${delimiter}\n${s.source}\n${delimiter}` : `${delimiter} ${s.source} ${delimiter}`;
  specHtml += `<div class="marked-katex-spec">${s.skip ? '' : marked.marked(md)}</div>`;
});
document.querySelector('#spec').innerHTML = specHtml;

describe('marked-katex-extension', function() {
  for (let i = 0; i < snapshotNames.length; i++) {
    const name = snapshotNames[i];

    it(name, function() {
      const el = document.querySelectorAll('.marked-katex');
      chai.expect(el[i].innerHTML).to.matchSnapshot();
    });
  }

  describe('spec', () => {
    for (let i = 0; i < specsList.length; i++) {
      const specItem = specsList[i];
      const func = specItem.only ? it.only : (specItem.skip ? it.skip : it);
      func(`Specs: ${specItem.name}`, () => {
        const resHtml = document.querySelectorAll('.marked-katex-spec').item(i).innerHTML;
        const multiline = specItem.source.includes('\n');
        const expected = multiline ? specItem.rendered : `<p>${specItem.rendered}</p>`;
        chai.expect(normalize(resHtml)).to.equal(normalize(expected));
      });
    }
  });
});
