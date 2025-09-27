import { createServer } from 'http';
import { BareServer } from 'bare-server-node';
import serveHandler from 'serve-handler';

const bare = new BareServer('/bare/', '');
const PORT = process.env.PORT || 8080;

const server = createServer(async (req, res) => {
  try {
    // First, let bare-server handle WebSocket upgrade or special requests
    const handled = bare.route_request(req, res);
    if (!handled) {
      // Fallback: serve static files from Site/ folder
      await serveHandler(req, res, {
        public: 'Site',
        cleanUrls: true,
      });
    }
  } catch (err) {
    // Catch everything and make sure headers are only sent once
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
    console.error(err);
  }
});

// Handle WebSocket upgrades via bare-server
server.on('upgrade', (req, socket, head) => {
  if (!bare.route_upgrade(req, socket, head)) {
    socket.end();
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
