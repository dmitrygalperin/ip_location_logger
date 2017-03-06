var http = require('http');

//get location with ip api
	var ip = '98.109.130.111';
	var options = {
		hostname: 'www.ip-api.com',
		port: '80',
		path: `/json/${ip}`
	};

	var callback = function(response){
		var body = '';
		response.on('data', function(data) {
			body += data;	
		});

		response.on('end', function() {
			var json = JSON.parse(body);
			if(json.status == 'success') {
				//action on sucess
				console.log(json.lat);
				console.log(json.lon);
				return true;
			} else {
				return false;
			}
		});
	}

	var req = http.request(options, callback);
	req.end();


