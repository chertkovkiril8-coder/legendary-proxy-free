const http = require('http');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});
const port = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  const target = req.url.startsWith('http') ? new URL(req.url).origin : `http://${req.headers.host}`;
  proxy.web(req, res, { target, changeOrigin: true }, (err) => {
    if (!res.headersSent) { res.writeHead(502); res.end('Proxy Error'); }
  });
});
server.on('connect', (req, socket, head) => {
  const [host, targetPort] = req.url.split(':');
  const remoteSocket = require('net').connect(targetPort || 443, host, () => {
    socket.write('HTTP/1.1 200 Connection Established\(\r\n\r\\)n');
    remoteSocket.write(head);
    remoteSocket.pipe(socket);
    socket.pipe(remoteSocket);
  });
  remoteSocket.on('error', () => socket.end());
  socket.on('error', () => remoteSocket.end());
});
server.listen(port, '0.0.0.0', () => console.log(`Active`));
