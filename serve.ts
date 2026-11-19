// Neon Coast Cover Studio — tiny static server for local testing (Node 22,
// standard library only). Serves app/ on http://localhost:8080 so the app
// can be tried in desktop Chrome exactly as the grader's static server will
// serve it. Development convenience only, not a server for the internet.
//
//   node serve.ts            (port 8080)
//   node serve.ts 8123       (port 8123)
//   PORT=8123 node serve.ts  (port 8123)

import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));

const byExtension = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.woff2', 'font/woff2'],
  ['.woff', 'font/woff'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function pickPort() {
  const fromArg = Number(process.argv[2]);
  if (Number.isInteger(fromArg) && fromArg > 0 && fromArg < 65536) return fromArg;
  const fromEnv = Number(process.env.PORT);
  if (Number.isInteger(fromEnv) && fromEnv > 0 && fromEnv < 65536) return fromEnv;
  return 8080;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname = '/';
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(appRoot, normalize(pathname)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  let body;
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    body = await readFile(file);
  } catch {
    response.writeHead(404).end('not found');
    return;
  }
  response.writeHead(200, {
    'content-type': byExtension.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
    'content-length': body.length,
    'cache-control': 'no-store',
  });
  response.end(body);
});

const port = pickPort();
server.listen(port, '127.0.0.1', () => {
  console.log(`Neon Coast Cover Studio is on http://localhost:${port}`);
});
