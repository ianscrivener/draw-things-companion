const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MOCKUP_PATH = path.join(__dirname, '../mockup.html');

const server = http.createServer((req, res) => {
    // Serve mockup.html for all requests
    fs.readFile(MOCKUP_PATH, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading mockup.html');
            console.error('Error reading file:', err);
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Mockup server running at http://localhost:${PORT}/`);
    console.log(`Serving: ${MOCKUP_PATH}`);
});
