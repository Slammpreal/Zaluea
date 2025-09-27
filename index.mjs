import Server from 'bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

// Bare server
const bare = new Server('/bare/', '');

// Static server
const serve = new nodeStatic.Server('Site/');

// HTTP server
const server = http.createServer((request, response) => {
    // If bare handles the request, exit early
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

// WebSocket / Upgrade
server.on('upgrade', (req, socket, head) => {
    if (bare.route_upgrade(req, socket, head)) return;
    socket.end();
});

// Listen on Render port
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
