const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedFilePath = path.join(__dirname, '..', 'sql', 'seed', 'dev_seed.sql');

async function main() {
  if (!fs.existsSync(seedFilePath)) {
    console.log('Seed file not found');
    process.exit(0);
  }

  const sql = fs.readFileSync(seedFilePath, 'utf8').trim();

  if (!sql) {
    console.log('Seed file is empty');
    process.exit(0);
  }

  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await client.connect();
  console.log('Connected to database');

  try {
    await client.query(sql);
    console.log('Seed complete');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Seed failed');
  console.error(error);
  process.exit(1);
});
