export const snapshots = {
  'readme example': 'katex: $c = \\pm\\sqrt{a^2 + b^2}$',
  'inline katex': `
This is inline katex: $c = \\pm\\sqrt{a^2 + b^2}$
`,
  'block katex': `
This is block level katex:

$$
c = \\pm\\sqrt{a^2 + b^2}
$$
`,
  'inline katex more $': `
This is inline katex with displayMode: $$c = \\pm\\sqrt{a^2 + b^2}$$
`,
  'inline katex 3 $': `
This is not inline katex: $$$c = \\pm\\sqrt{a^2 + b^2}$$$
`,
  'block katex more $': `
This is not katex:

$$$
c = \\pm\\sqrt{a^2 + b^2}
$$$
`,
  'block katex 1 $': `
This is block level katex:

$
c = \\pm\\sqrt{a^2 + b^2}
$
`,
  'not katex': 'not katex $300 $400',
  'not katex at beginning': '$300 $400 not katex',
  'not katex at end': 'not katex 300$ 400$',
  'block katex with $ inside': `
$$
\\colorbox{aqua}{$
\\frac{b}{2}\\sqrt{a^2-\\frac{b^2}{4}}
a$}
$$
`,
  'inline katex with $ inside':
    'this is inline katex: $a\\raisebox{0.25em}{$b$}c$',
  'inline katex with a question mark after': 'this is inline katex: $x$?',
  'inline katex with an exclamation mark after': 'this is inline katex: $x$!',
  'inline katex with a period after': 'this is inline katex: $x$.',
  'inline katex with a comma after': 'this is inline katex: $x$,',
  'inline katex with a colon after': 'this is inline katex: $x$:',
  'inline katex $$...$': 'this is not katex: $$a\\raisebox{0.25em}{$b$}c$',
  'inline katex $...$$': 'this is not katex: $a\\raisebox{0.25em}{$b$}c$$',
  'slash $': 'must include space between katex and end delimiter: $ \\$ $',
  'block slash $': `
this is block katex:

$$
\\$\\$
$$
`,
  'inline katex with newline': `
this is not katex: $
c = \\pm\\sqrt{a^2 + b^2}
$
`,
  'multiple inline katex $': `
this is katex: **pi:** $\\pi$ **theta:** $\\theta$
`,
  'multiple inline katex $$': `
this is katex: **pi:** $$\\pi$$ **theta:** $$\\theta$$
`,
  'multiple block katex $': `
# pi:

$
\\pi
$

# theta:

$
\\theta
$
`,
  'multiple block katex $$': `
# pi:

$$
\\pi
$$

# theta:

$$
\\theta
$$
`
};

export function normalize(str) {
  return str
    .replace(/<(\w+)([^>]*)><\/\1>/g, '<$1$2/>')
    .replace(/'|`|ˋ|ˊ|&quot;|&#x27;/g, '"')
    .replace(/\s|&nbsp;/g, '')
    .replace(/\\VERT|\\\|/ig, '|')
    .replace('"=""', '"/')
    .replace(/\\cr/g, '\\\\');
}

/**
 * Replace double quotation marks with single quotation marks.
 * @param {string} tag
 */
function repalceQuotation(tag) {
  const result = tag.replace(/(\S+)=("([^"]*)")/g, (match, attr, val) => {
    if (attr === 'xmlns') {
      return match;
    }
    return `${attr}=${val.replace(/\"/g, "'")}`;
  });

  return result;
}

/**
 * Processing the html string to adapt index.test.js.snap.
 * @param {string} html
 */
export function normalizeSnapshotHtml(str) {
  return str
    .replace(/<(\w+)([^>]*)\/>/g, '<$1$3></$2>')
    .replace(/<svg[^>]*>([\s\S]*?)<\/svg>/g, (match, p1) => {
      // First process the attributes of the svg tag itself.
      const svgTag = repalceQuotation(match.match(/<svg[^>]*>/)[0]);

      // Then processing internal tags recursively
      const content = p1.replace(/<[^>]*>/g, tag => {
        return repalceQuotation(tag);
      });

      let svg = `${svgTag}${content}</svg>`;
      // Replace empty tags
      svg = svg.replace(/<([^\s>]+)[^>]*\s*>(?:\s*|<\/\\1>)*<\/\1>/g, (match, tagName) => {
        let attrs = match.match(/[\w-]+=("[^"]*"|'[^']*')|\w+="[^"]*"|\w+='[^']*'/g);
        if (attrs) {
          attrs = attrs.join(' ');
          return `<${tagName} ${attrs}/>`;
        }
        return `<${tagName} />`;
      });
      return svg;
    });
}
