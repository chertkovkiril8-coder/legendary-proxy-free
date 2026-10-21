const http = require('http');
const net = require('net');
const port = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Proxy Up');
});

server.on('connect', (req, socket, head) => {
  const [host, targetPort] = req.url.split(':');
  const remoteSocket = net.connect(targetPort || 443, host, () => {
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    if (head && head.length > 0) remoteSocket.write(head);
    remoteSocket.pipe(socket);
    socket.pipe(remoteSocket);
  });
  
  remoteSocket.on('error', () => socket.end());
  socket.on('error', () => remoteSocket.end());
});

server.listen(port, '0.0.0.0', () => console.log('Active'));
