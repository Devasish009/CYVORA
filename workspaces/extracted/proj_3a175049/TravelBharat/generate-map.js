const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(
  'C:/Users/SLIM3/.gemini/antigravity/brain/9add6b10-7a5d-4f8f-b3cf-20ca51074d35/.system_generated/steps/98/content.md',
  'utf8'
);

const jsonStart = raw.indexOf('export default ') + 15;
const jsonStr = raw.substring(jsonStart).trim();
const data = JSON.parse(jsonStr);

const skipIds = ['an', 'ld']; // Skip Andaman & Lakshadweep (islands far away)

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 696" id="mapSvg">\n`;

data.locations.forEach(loc => {
  if (skipIds.includes(loc.id)) return;
  svg += `  <path id="${loc.id}" d="${loc.path}" fill="none" stroke="#FFD700" stroke-width="0.8" opacity="0" class="state-path"/>\n`;
});

svg += `</svg>`;

const outPath = path.join(__dirname, 'public', 'img', 'india-map.svg');
fs.writeFileSync(outPath, svg);
console.log('SVG created with', data.locations.filter(l => !skipIds.includes(l.id)).length, 'states at', outPath);
