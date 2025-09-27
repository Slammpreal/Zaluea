import Server from 'bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

const bare = new Server('/bare/', '');
const serve = new nodeStatic.Server('Site/');
const server = http.createServer();

server.on('request', (request, response) => {
    try {
        const handled = bare.route_request(request, response);
        if (!handled) {
            serve.serve(request, response, (err) => {
                if (err) {
                    response.writeHead(err.status || 500, { 'Content-Type': 'text/plain' });
                    response.end(err.message);
                }
            });
        }
    } catch (e) {
        if (!response.headersSent) {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Internal server error');
        }
        console.error(e);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (!bare.route_upgrade(req, socket, head)) {
        socket.end();
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
