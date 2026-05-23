const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const APP_USER = process.env.APP_USER || '';
const APP_PASSWORD = process.env.APP_PASSWORD || '';
const ROOT = __dirname;

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

const server = http.createServer(async (req, res) => {
  if (!isAuthorized(req)) {
    requestAuth(res);
    return;
  }

  try {
    const url = new URL(req.url, 'http://localhost');
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
