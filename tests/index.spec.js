import chai from 'chai';
import marked from 'marked';
import { it } from 'mocha';

import { matchSnapshot } from 'chai-karma-snapshot';
import markedKatex from '../src/index';
import { snapshots } from '../spec/util';

chai.use(matchSnapshot);

const snapshotNames = Object.keys(snapshots);

document.body.innerHTML = '<div id="main"></div><div id="spec"></div>';

marked.setOptions(marked.getDefaults());
marked.use(markedKatex());

const html = snapshotNames.map((name) => `<div class="marked-katex">${marked.marked(snapshots[name])}</div>`).join('');
document.querySelector('#main').innerHTML = html;

describe('marked-katex-extension', function() {
  for (let i = 0; i < snapshotNames.length; i++) {
    const name = snapshotNames[i];

    it(name, function() {
      const el = document.querySelectorAll('.marked-katex');
      chai.expect(el[i].innerHTML).to.matchSnapshot();
    });
  }
});
