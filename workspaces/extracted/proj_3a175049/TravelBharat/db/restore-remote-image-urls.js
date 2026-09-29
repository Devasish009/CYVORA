const fs = require('fs').promises;
const path = require('path');
const pool = require('./index');

function splitTuples(sqlFragment) {
  const tuples = [];
  let i = 0;
  while (i < sqlFragment.length) {
    while (i < sqlFragment.length && /[\s,]/.test(sqlFragment[i])) i += 1;
    if (sqlFragment[i] !== '(') break;
    i += 1; // skip '('
    const tuple = [];
    let value = '';
    let inString = false;
    let char;

    while (i < sqlFragment.length) {
      char = sqlFragment[i];
      if (inString) {
        if (char === "'") {
          if (sqlFragment[i + 1] === "'") {
            value += "'";
            i += 2;
            continue;
          }
          inString = false;
          i += 1;
          continue;
        }
        value += char;
        i += 1;
        continue;
      }

      if (char === "'") {
        inString = true;
        i += 1;
        continue;
      }

      if (char === ',') {
        tuple.push(value.trim());
        value = '';
        i += 1;
        continue;
      }

      if (char === ')') {
        tuple.push(value.trim());
        value = '';
        i += 1;
        break;
      }

      value += char;
      i += 1;
    }

    tuples.push(tuple.map((v) => {
      if (v === 'NULL' || v === '') return null;
      if (/^-?\d+$/.test(v)) return Number.parseInt(v, 10);
      return v;
    }));
    while (i < sqlFragment.length && /[\s,]/.test(sqlFragment[i])) i += 1;
    if (sqlFragment[i] === ',') i += 1;
  }
  return tuples;
}

function extractValueBlocks(sql, tableName) {
  const blocks = [];
  const search = `INSERT INTO ${tableName}`;
  let pos = 0;

  while (true) {
    const start = sql.indexOf(search, pos);
    if (start === -1) break;
    const valuesIndex = sql.indexOf('VALUES', start);
    if (valuesIndex === -1) break;

    const blockStart = valuesIndex + 'VALUES'.length;
    const end = sql.indexOf(');', blockStart);
    if (end === -1) break;

    blocks.push(sql.slice(blockStart, end + 1));
    pos = end + 2;
  }

  if (!blocks.length) {
    throw new Error(`Could not find INSERT INTO ${tableName} VALUES block`);
  }
  return blocks;
}

function normalizeText(value) {
  if (value === null) return null;
  if (typeof value === 'string') return value.trim();
  return value;
}

function extractRemoteImageUrl(values, columns) {
  const imageUrlIndex = columns.indexOf('image_url');
  if (imageUrlIndex < 0) throw new Error('No image_url column found');
  return normalizeText(values[imageUrlIndex]);
}

async function restoreUrls() {
  const seedSql = await fs.readFile(path.join(__dirname, 'seed.sql'), 'utf8');

  const stateBlocks = extractValueBlocks(seedSql, 'states');
  const destBlocks = extractValueBlocks(seedSql, 'destinations');

  const stateColumns = ['name', 'type', 'capital', 'region', 'description', 'image_url', 'best_time', 'language', 'famous_for', 'destinations_count'];
  const destColumns = ['state_id', 'name', 'category', 'description', 'image_url', 'entry_fee', 'best_time', 'rating'];

  const stateTuples = stateBlocks.flatMap((block) => splitTuples(block));
  const destTuples = destBlocks.flatMap((block) => splitTuples(block));

  const stateUpdates = stateTuples.map((row) => ({ name: row[0], image_url: row[5] }));
  const destUpdates = destTuples.map((row) => ({ name: row[1], image_url: row[4] }));

  for (const state of stateUpdates) {
    if (!state.name || !state.image_url) continue;
    await pool.query(
      'UPDATE states SET image_url = $1 WHERE name = $2',
      [state.image_url, state.name]
    );
  }

  for (const dest of destUpdates) {
    if (!dest.name || !dest.image_url) continue;
    await pool.query(
      'UPDATE destinations SET image_url = $1 WHERE name = $2',
      [dest.image_url, dest.name]
    );
  }

  console.log('Restored state and destination image URLs from seed.sql.');
}

restoreUrls()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
