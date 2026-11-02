// Creates one client (a customer app) and one API key for the Reviews service. Run with the owner role.
//   set -a; . ~/.tysonlabs-reviews/credentials.env; set +a
//   node scripts/provision-client.mjs --name "SDPC" --return-url https://app.example.com/integrations --label SDPC
// The API key is written to the credentials file (mode 600) as REVIEWS_API_KEY_<LABEL> and never printed.
import { createHmac, randomBytes } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import pg from 'pg';

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const name = arg('name'), returnUrl = arg('return-url'), label = (arg('label') ?? '').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
if (!name || !returnUrl || !label) { console.error('Usage: --name <client name> --return-url <https url> --label <ENV_LABEL>'); process.exit(2); }
if (!returnUrl.startsWith('https://')) { console.error('Return URL must be https'); process.exit(2); }
const ownerUrl = process.env.REVIEWS_OWNER_URL, pepper = process.env.API_KEY_PEPPER;
if (!ownerUrl || !pepper) { console.error('REVIEWS_OWNER_URL and API_KEY_PEPPER must be set (source the credentials file)'); process.exit(2); }
const credFile = process.env.REVIEWS_CRED_FILE ?? path.join(homedir(), '.tysonlabs-reviews', 'credentials.env');
const varName = `REVIEWS_API_KEY_${label}`;
if (existsSync(credFile) && readFileSync(credFile, 'utf8').includes(`${varName}=`)) { console.error(`${varName} already exists in ${credFile}; refusing to overwrite`); process.exit(1); }

const token = (n) => randomBytes(n).toString('base64url');
const keyId = token(9).replace(/[_-]/g, 'x');
const secret = token(32);
const key = `rk_live_${keyId}_${secret}`;
const hash = createHmac('sha256', pepper).update(secret).digest();

const db = new pg.Client({ connectionString: ownerUrl });
await db.connect();
try {
  await db.query('BEGIN');
  const exists = await db.query('SELECT 1 FROM clients WHERE name = $1', [name]);
  if (exists.rowCount) throw new Error(`a client named "${name}" already exists; nothing changed`);
  const c = await db.query('INSERT INTO clients (name, allowed_return_urls) VALUES ($1, ARRAY[$2]) RETURNING id', [name, returnUrl]);
  await db.query('INSERT INTO api_keys (client_id, key_id, secret_hash) VALUES ($1,$2,$3)', [c.rows[0].id, keyId, hash]);
  await db.query('COMMIT');
  appendFileSync(credFile, `${varName}='${key}'\n`, { mode: 0o600 });
  console.log(`Created client "${name}" (${c.rows[0].id}), key id ${keyId}. The key was saved to ${credFile} as ${varName} and not printed.`);
} catch (e) {
  await db.query('ROLLBACK').catch(() => {});
  console.error(`ABORT: ${e.message}`);
  process.exitCode = 1;
} finally {
  await db.end();
}
