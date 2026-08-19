const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const APP_USER = process.env.APP_USER || '';
const APP_PASSWORD = process.env.APP_PASSWORD || '';
const SYNC_TOKEN = process.env.SYNC_TOKEN || '';
const DATABASE_URL = process.env.DATABASE_URL || '';
const ROOT = __dirname;
let dbPool = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function isAuthorized(req) {
  if (!APP_USER || !APP_PASSWORD) return true;

  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;

  const value = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const separator = value.indexOf(':');
  if (separator < 0) return false;

  const user = value.slice(0, separator);
  const password = value.slice(separator + 1);
  return user === APP_USER && password === APP_PASSWORD;
}

function requestAuth(res) {
  res.writeHead(401, {
    'WWW-Authenticate': 'Basic realm="Roteiro de Palco"',
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end('Acesso protegido.');
}

function isSyncAuthorized(req) {
  if (!SYNC_TOKEN) return true;
  return req.headers['x-sync-token'] === SYNC_TOKEN;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error('Payload muito grande'));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
  });
}

async function getDb() {
  if (!DATABASE_URL) return null;
  if (dbPool) return dbPool;

  const { Pool } = require('pg');
  dbPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS palco_sync (
      id TEXT PRIMARY KEY,
      state JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  return dbPool;
}

async function handleSyncRequest(req, res) {
  if (!isSyncAuthorized(req)) {
    sendJson(res, 401, { ok: false, error: 'Código de sincronização inválido.' });
    return;
  }

  const db = await getDb();
  if (!db) {
    sendJson(res, 503, { ok: false, error: 'Banco de dados não configurado no Railway.' });
    return;
  }

  if (req.method === 'GET') {
    const result = await db.query('SELECT state, updated_at FROM palco_sync WHERE id = $1', ['main']);
    if (!result.rows.length) {
      sendJson(res, 404, { ok: false, error: 'Nenhum roteiro salvo na nuvem ainda.' });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      state: result.rows[0].state,
      updatedAt: result.rows[0].updated_at,
    });
    return;
  }

  if (req.method === 'PUT') {
    const body = await readJsonBody(req);
    if (!body.state || !Array.isArray(body.state.routes)) {
      sendJson(res, 400, { ok: false, error: 'Dados de roteiro inválidos.' });
      return;
    }

    const result = await db.query(
      `
        INSERT INTO palco_sync (id, state, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (id)
        DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()
        RETURNING updated_at
      `,
      ['main', body.state],
    );

    sendJson(res, 200, { ok: true, updatedAt: result.rows[0].updated_at });
    return;
  }

  sendJson(res, 405, { ok: false, error: 'Método não permitido.' });
}

const server = http.createServer(async (req, res) => {
  if (!isAuthorized(req)) {
    requestAuth(res);
    return;
  }

  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/sync') {
      try {
        await handleSyncRequest(req, res);
      } catch (error) {
        sendJson(res, 500, { ok: false, error: error.message || 'Erro na sincronização.' });
      }
      return;
    }

    const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const filePath = path.resolve(ROOT, requested);

    if (!filePath.startsWith(ROOT) || path.basename(filePath) === 'server.js') {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const ext = path.extname(filePath);
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=3600',
    });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Roteiro de Palco ouvindo na porta ${PORT}`);
});
