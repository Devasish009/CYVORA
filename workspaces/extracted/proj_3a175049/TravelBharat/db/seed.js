const fs = require('fs');
const path = require('path');
const pool = require('./index');

async function runSqlFile(filename) {
  const sql = fs.readFileSync(path.join(__dirname, filename), 'utf8');
  if (!sql.trim()) return;
  await pool.query(sql);
}

async function seed() {
  try {
    await runSqlFile('schema.sql');
    await pool.query('TRUNCATE TABLE "session", gallery_images, destinations, states, users RESTART IDENTITY CASCADE');
    await runSqlFile('seed.sql');
    await runSqlFile('seed-extra.sql');
    console.log('TravelBharat database seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
