const pool = require('./index');

function encodeTerm(value) {
  return encodeURIComponent(`${value} India`);
}

async function main() {
  try {
    const states = (await pool.query('SELECT id, name FROM states')).rows;
    for (const state of states) {
      const url = `https://source.unsplash.com/1200x800/?${encodeTerm(state.name)}`;
      await pool.query('UPDATE states SET image_url = $1 WHERE id = $2', [url, state.id]);
      console.log(`State ${state.name} -> ${url}`);
    }

    const destinations = (await pool.query('SELECT id, name FROM destinations')).rows;
    for (const destination of destinations) {
      const url = `https://source.unsplash.com/1200x800/?${encodeURIComponent(destination.name)}`;
      await pool.query('UPDATE destinations SET image_url = $1 WHERE id = $2', [url, destination.id]);
      console.log(`Destination ${destination.name} -> ${url}`);
    }

    console.log('Updated states and destinations to Unsplash image URLs.');
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
