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

		return response.on('end', function() {
			var json = JSON.parse(body);
			if(json.status == 'success') {
				//action on sucess
				 var coords = {latitude: json.lat, longitude: json.lon};
				 console.log(coords);
				//res.write(coords);
				 //res.end();
			} else {
				return false;
			}
		});
	}

	var req = http.request(options, callback);
	console.log(req.data);
	req.end();

	



