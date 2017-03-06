const http = require('http');
const hostname = '127.0.0.1';
const port= 9000;

const server = http.createServer((request, response) => {
	response.statusCode = 200;
	response.setHeader('Content-Type', 'text/plain');
	var ip = request.headers['x-forwarded-for'];
	response.end(ip);
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
