const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: 'postgresql://postgres:bharat123@127.0.0.1:5432/travelbharat' });

async function fixAdmin() {
  const hash = await bcrypt.hash('bharat123', 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [hash, 'admin']);
  console.log('✅ Admin password hash updated successfully!');
  console.log('   Login: username = admin | password = bharat123');
  await pool.end();
}

fixAdmin().catch(console.error);
