import { Server } from '@tomphttp/bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

const bare = new Server('/bare/', '');
const serve = new nodeStatic.Server('Site/');
const server = http.createServer();

server.on('request', (req, res) => {
    try {
        const handled = bare.route_request(req, res);
        if (!handled) {
            serve.serve(req, res, (err) => {
                if (err && !res.headersSent) {
                    res.writeHead(err.status || 500, { 'Content-Type': 'text/plain' });
                    res.end(err.message);
                }
            });
        }
    } catch (e) {
        console.error(e);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    }
});

server.on('upgrade', (req, socket, head) => {
    const handled = bare.route_upgrade(req, socket, head);
    if (!handled) {
        socket.end();
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
