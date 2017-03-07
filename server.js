const http = require('http');
const fs = require('fs');
const ipApi = require('get_ip_api.js');

const hostname = '127.0.0.1';
const port= 9000;

const rootPath = '/location_app/';
const jsPath = 'static/locate.js';
const htmlPath = 'static/location.html';

const server = http.createServer((req, res) => {

	console.log(req.url);

	var ip = req.headers['x-forwarded-for'];
	if (req.url == rootPath) {
        fs.readFile('static/location.html', function(err, page) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(page);
            res.end();
        });
    } else if (req.url == '/location_app/static/locate.js') {
    	script = fs.readFileSync(jsPath, 'utf-8');
    	res.write(script);
    	res.end();
    } else if (req.url == '/location_app/get_coords/') {
    	console.log('success');
    	if(req.headers['x-requested-with'] == 'XMLHttpRequest'){
    		//get location from 
    		var req = http.request(ipApi.options, ipApi.callback);
    		res.write(ip);
    		res.end();
    	} else {
    		show404();
    	}
    	res.end();
    } else {
    	show404();
    	res.end()
    }

    function show404() {
    	res.writeHead(404, {'Content-Type': 'text/plain'});
    	res.write("404. Not Found");
    }
    
});

server.listen(port, hostname, () => {
	console.log(`Server running at hostname http://${hostname}:${port}/`);
});