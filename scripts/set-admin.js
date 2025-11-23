#!/usr/bin/env node

/**
 * Admin credential script
 *
 * Usage:
 *   node scripts/set-admin.js <username> <plainPassword>
 *
 * The script hashes the provided password with bcrypt and upserts the admin user
 * (id = 1) in the `users` table. It also ensures the admin has all permissions.
 *
 * Required environment variables (via .env):
 *   DATABASE_URL – PostgreSQL connection string
 *
 * Note: This script is intended to be run only by a trusted operator.
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const SALT_ROUNDS = 10;
const ADMIN_ID = 1;

// All possible permissions (admin has everything)
const ALL_PERMISSIONS = [
  'tasks',
  'users',
  'locations',
  'tags',
  'deviceTypes',
  'problemTypes',
  'statuses',
];

async function main() {
  const [username, plainPassword] = process.argv.slice(2);
  if (!username || !plainPassword) {
    console.error('Usage: node scripts/set-admin.js <username> <plainPassword>');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  const permissionsJson = JSON.stringify(ALL_PERMISSIONS);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert admin user (id = 1)
    const upsertQuery = `
      INSERT INTO users (id, username, password_hash, permissions)
      VALUES ($1, $2, $3, $4::jsonb)
      ON CONFLICT (id) DO UPDATE
        SET username = EXCLUDED.username,
            password_hash = EXCLUDED.password_hash,
            permissions = EXCLUDED.permissions;
    `;
    await client.query(upsertQuery, [ADMIN_ID, username, passwordHash, permissionsJson]);

    await client.query('COMMIT');
    console.log('✅ Admin user (id=1) has been created/updated successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error while setting admin credentials:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();