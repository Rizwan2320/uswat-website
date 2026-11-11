import http from 'node:http'
import fs from 'node:fs'
import { toNodeHandler } from 'better-auth/node'
import { auth, PORT } from './auth.mjs'
const handler = toNodeHandler(auth)
const html = '<!doctype html><meta charset=utf-8><title>fp0</title><script src="/client.js"></script><body>fp0 spike</body>'
http.createServer((req, res) => {
  if (req.url.startsWith('/api/auth')) return handler(req, res)
  if (req.url === '/client.js') { res.setHeader('content-type', 'text/javascript'); return res.end(fs.readFileSync(new URL('./out/client.js', import.meta.url))) }
  res.setHeader('content-type', 'text/html'); res.end(html)
}).listen(PORT, '127.0.0.1', () => console.log('listening', PORT))
