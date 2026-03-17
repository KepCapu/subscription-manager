const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const migrationsDir = path.join(__dirname, '..', 'sql', 'migrations');

async function ensureSchemaMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query(
    'SELECT id FROM schema_migrations ORDER BY id ASC;'
  );
  return new Set(result.rows.map((row) => row.id));
}

function getMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

async function applyMigration(client, fileName) {
  const filePath = path.join(migrationsDir, fileName);
  const sql = fs.readFileSync(filePath, 'utf8').trim();

  if (!sql) {
    console.log(`- skipping empty migration: ${fileName}`);
    return;
  }

  console.log(`- applying: ${fileName}`);

  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      'INSERT INTO schema_migrations (id) VALUES ($1)',
      [fileName]
    );
    await client.query('COMMIT');
    console.log(`  applied: ${fileName}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
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
    await ensureSchemaMigrationsTable(client);

    const applied = await getAppliedMigrations(client);
    const files = getMigrationFiles();

    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`- already applied: ${file}`);
        continue;
      }

      await applyMigration(client, file);
    }

    console.log('Migrations complete');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Migration failed');
  console.error(error);
  process.exit(1);
});
