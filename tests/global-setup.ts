import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Starts a throwaway local Postgres cluster (never a real database), applies db/migrations as the owner role.
const BIN = process.env.PG_BIN ?? '/opt/homebrew/opt/postgresql@17/bin';
let PORT = 0;
let dir = '';
process.env.LC_ALL = 'en_US.UTF-8'; // macOS: postgres refuses to start without a valid locale

export async function setup() {
  dir = mkdtempSync(path.join(tmpdir(), 'reviews-pg-'));
  execFileSync(`${BIN}/initdb`, ['-D', dir, '-U', 'postgres', '--auth=trust', '-E', 'UTF8'], { stdio: 'ignore' });
  for (let attempt = 1; ; attempt++) {
    PORT = 54000 + Math.floor(Math.random() * 900);
    try {
      execFileSync(`${BIN}/pg_ctl`, ['-D', dir, '-o', `-p ${PORT} -c listen_addresses=127.0.0.1 -c unix_socket_directories=`, '-w', '-l', path.join(dir, 'log'), 'start'], { stdio: 'ignore' });
      break;
    } catch (err) {
      if (attempt >= 4) throw err; // port clash or transient start failure: try another port
    }
  }
  const psql = (db: string, sql: string, user = 'postgres') =>
    execFileSync(`${BIN}/psql`, ['-h', '127.0.0.1', '-p', String(PORT), '-U', user, '-d', db, '-v', 'ON_ERROR_STOP=1', '-c', sql], { stdio: 'pipe' });
  psql('postgres', 'CREATE DATABASE reviews');
  const roles = readFileSync('db/roles.sql', 'utf8').replace('CHANGE_ME_OWNER', 'owner').replace('CHANGE_ME_APP', 'app');
  psql('reviews', roles);
  const migration = spawnSync(`${BIN}/psql`, ['-h', '127.0.0.1', '-p', String(PORT), '-U', 'reviews_owner', '-d', 'reviews', '-v', 'ON_ERROR_STOP=1', '-f', 'db/migrations/0001_init.sql'], {
    env: { ...process.env, PGPASSWORD: 'owner' },
  });
  if (migration.status !== 0) throw new Error(`migration failed: ${migration.stderr}`);
  process.env.TEST_OWNER_URL = `postgres://reviews_owner:owner@127.0.0.1:${PORT}/reviews`;
  process.env.TEST_APP_URL = `postgres://reviews_app:app@127.0.0.1:${PORT}/reviews`;
}

export async function teardown() {
  try {
    execFileSync(`${BIN}/pg_ctl`, ['-D', dir, '-m', 'immediate', 'stop'], { stdio: 'ignore' });
  } catch {
    /* not running */
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
