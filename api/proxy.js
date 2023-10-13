const http = require('http');
const https = require('https');

const proxyServer = (req, res) => {
    const { url, method, headers, data } = req.body;

    const protocol = url.startsWith('https') ? https : http;

    const requestOptions = {
        method: method || 'GET',
        headers: headers || {},
    };

    const proxyRequest = protocol.request(url, requestOptions, (proxyRes) => {
        let responseData = '';

        proxyRes.on('data', (chunk) => {
            responseData += chunk;
        });

        proxyRes.on('end', () => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            res.end(responseData);
        });
    });

    proxyRequest.on('error', (error) => {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        proxyRequest.write(JSON.stringify(data));
    }

    proxyRequest.end();
};

module.exports = proxyServer;
