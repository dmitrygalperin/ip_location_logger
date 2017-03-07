const http = require('http');
const fs = require('fs');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('ip_logs.db');

var qs = require('querystring');

const hostname = '127.0.0.1';
const port= 9000;

const rootPath = '/location_app/';
const jsPath = 'static/locate.js';
const htmlPath = 'static/location.html';
const ipApiPath = 'get_coords/';
const logIpPath = 'log_ip/';

const server = http.createServer((req, res) => {

	console.log(`Fetching ${req.url}`);

	var ip = req.headers['x-forwarded-for'];
	if (req.url == rootPath) {
		//display root page
        fs.readFile(htmlPath, function(err, page) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(page);
            res.end();
        });
    } else if (req.url == rootPath.concat(jsPath)) {
    	//provide client-side js
    	script = fs.readFileSync(jsPath, 'utf-8');
    	res.write(script);
    	res.end();
    } else if (req.url == rootPath.concat(ipApiPath) &&
    	req.headers['x-requested-with'] == 'XMLHttpRequest') {
    	//only allow ip-api.com API request if requested with AJAX

			var callback = function(response){
				var body = '';
				response.on('data', function(data) {
					body += data;	
				});

				response.on('end', function(err) {
					var json = JSON.parse(body);
					if(err) {
						console.error(err);
					} else if(json.status == 'success') {
						//send coords back to AJAX request
						var coords = JSON.stringify({lat: json.lat, lon: json.lon});
						console.log(`ip-api.com returned: ${coords}`);
						res.write(coords);
						logVisit(ip, json.lat, json.lon);
					} else {
						//find ip location in local db
						console.log('No result from ip-api.com. Must use local database');
					}
					res.end();
				});
			}

			console.log('HTML5 geolocation failed/denied. Trying ip-api.com API...');

			var options = {
				hostname: 'www.ip-api.com',
				port: '80',
				path: `/json/${ip}`
			};

			var req = http.request(options, callback);
			req.end();
    } else if (req.url == rootPath.concat(logIpPath) &&
    	req.headers['x-requested-with'] == 'XMLHttpRequest') {

    	if(req.method =='POST') {
    		var body = '';
    		req.on('data', function (data) {
    			body += data;
    		});

    		req.on('end', function () {
    			var json = qs.parse(body);
    			var coords = JSON.stringify(json);
    			console.log(`Received coordinates from client: ${coords}`);
    			logVisit(ip, json.lat, json.lon);
    		});
    	}

	} else {
    	show404();
    	res.end();
    }

    function show404() {
    	res.writeHead(404, {'Content-Type': 'text/plain'});
    	res.write("404. Not Found");
    }
    
});

function logVisit(ip, lon, lat) {
	db.serialize(function () {
		var query = `INSERT INTO ip_logs VALUES("${ip}", ${lon}, ${lat})`;
		db.run(query);
		console.log("IP location logged to DB.")
	});
}

server.listen(port, hostname, () => {
	console.log(`Server running at hostname http://${hostname}:${port}/`);
});