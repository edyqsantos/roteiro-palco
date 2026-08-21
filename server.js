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
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS palco_urgent (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

async function handleUrgentRequest(req, res) {
  if (!isSyncAuthorized(req)) {
    sendJson(res, 401, { ok: false, error: 'Código de sincronização inválido.' });
    return;
  }

  const db = await getDb();
  if (!db) {
    sendJson(res, 503, { ok: false, error: 'Banco de dados não configurado no Railway.' });
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Método não permitido.' });
    return;
  }

  const result = await db.query(
    `
      SELECT id, title, text, created_at
      FROM palco_urgent
      ORDER BY created_at DESC
      LIMIT 20
    `,
  );

  sendJson(res, 200, {
    ok: true,
    messages: result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      text: row.text,
      createdAt: row.created_at,
    })),
  });
}

async function handleUrgentSubmit(req, res, url) {
  const token = url.searchParams.get('token') || req.headers['x-sync-token'] || '';
  if (SYNC_TOKEN && token !== SYNC_TOKEN) {
    sendJson(res, 401, { ok: false, error: 'Link urgente inválido.' });
    return;
  }

  const db = await getDb();
  if (!db) {
    sendJson(res, 503, { ok: false, error: 'Banco de dados não configurado no Railway.' });
    return;
  }

  if (req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Urgente - Palco</title>
          <style>
            body { margin: 0; min-height: 100vh; background: #121417; color: #f4f2ec; font-family: Arial, sans-serif; padding: 18px; }
            main { max-width: 560px; margin: 0 auto; display: grid; gap: 14px; }
            label { display: grid; gap: 6px; color: #aeb6bf; }
            input, textarea, button { font: inherit; border-radius: 8px; border: 1px solid #303842; }
            input, textarea { background: #1b1f24; color: #f4f2ec; padding: 12px; }
            button { min-height: 50px; background: #f4c95d; color: #211a0a; font-weight: 800; }
          </style>
        </head>
        <body>
          <main>
            <h1>Enviar urgente</h1>
            <label>Título<input id="title" placeholder="Ex: Carro com alarme" /></label>
            <label>Recado<textarea id="text" rows="8" placeholder="Digite o recado para o locutor"></textarea></label>
            <button id="send">Enviar</button>
            <p id="status"></p>
          </main>
          <script>
            document.querySelector('#send').addEventListener('click', async () => {
              const status = document.querySelector('#status');
              status.textContent = 'Enviando...';
              const response = await fetch(location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: document.querySelector('#title').value,
                  text: document.querySelector('#text').value,
                }),
              });
              status.textContent = response.ok ? 'Enviado.' : 'Não foi possível enviar.';
            });
          </script>
        </body>
      </html>
    `);
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Método não permitido.' });
    return;
  }

  const body = await readJsonBody(req);
  const title = String(body.title || 'Urgente').trim().slice(0, 80) || 'Urgente';
  const text = String(body.text || '').trim();
  if (!text) {
    sendJson(res, 400, { ok: false, error: 'Escreva o recado.' });
    return;
  }

  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const result = await db.query(
    `
      INSERT INTO palco_urgent (id, title, text, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING created_at
    `,
    [id, title, text],
  );

  sendJson(res, 200, { ok: true, id, createdAt: result.rows[0].created_at });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/urgent-submit') {
      try {
        await handleUrgentSubmit(req, res, url);
      } catch (error) {
        sendJson(res, 500, { ok: false, error: error.message || 'Erro no urgente.' });
      }
      return;
    }

    if (!isAuthorized(req)) {
      requestAuth(res);
      return;
    }

    if (url.pathname === '/api/sync') {
      try {
        await handleSyncRequest(req, res);
      } catch (error) {
        sendJson(res, 500, { ok: false, error: error.message || 'Erro na sincronização.' });
      }
      return;
    }
    if (url.pathname === '/api/urgent') {
      try {
        await handleUrgentRequest(req, res);
      } catch (error) {
        sendJson(res, 500, { ok: false, error: error.message || 'Erro no urgente.' });
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
