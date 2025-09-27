import Server from 'bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

// Bare server for /bare/ routes
const bare = new Server('/bare/', '');

// Static server for Site/ folder
const serve = new nodeStatic.Server('Site/');

// HTTP server
const server = http.createServer((request, response) => {
    // Let Bare handle requests first
    if (bare.route_request(request, response)) return;

    // Serve static files safely
    request.addListener('end', () => {
        serve.serve(request, response, (err) => {
            if (err && !response.headersSent) {
                response.writeHead(err.status, err.headers);
                response.end(`Error: ${err.message}`);
            }
        });
    }).resume();
});

// WebSocket / Upgrade handling
server.on('upgrade', (req, socket, head) => {
    if (bare.route_upgrade(req, socket, head)) return;
    socket.end();
});

// Listen on Render-assigned port
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
