const config = require('../config');
const server = require('../server');
const http   = require('http');

module.exports = function (io, con) {

    io.on('connection', function(socket) {

        socket.on('request-coords', function () {
            con.query('SELECT ip_addr, latitude, longitude, time FROM ip_logs', function(err, rows) {
                if(err) throw err;

                for (var i = 0; i < rows.length; i++) {
                    socket.emit('coords', {ip: rows[i].ip_addr, lon: rows[i].longitude, lat: rows[i].latitude, time: rows[i].time});
                }
                socket.emit('coords-done');
            });
        });

        socket.on('geolocation', function(data) {
            socket.emit('client-ip', {ip: server.ip});
            logVisit(server.ip, data.lat, data.lon);
        });

        socket.on('api-coords-req', function() {
            var callback = function(response){
                var body = '';
                response.on('data', function(data) {
                    body += data;   
                });

                response.on('end', function(err) {
                    var json = JSON.parse(body);
                    if(err) {
                        console.error(err);
                    } else if(json.latitude) {
                        //send coords back to client
                        var coords = JSON.stringify({lat: json.latitude, lon: json.longitude});
                        console.log(`API returned: ${coords}`);
                        socket.emit('api-coords', {lat: json.latitude, lon: json.longitude, ip: server.ip});
                        logVisit(server.ip, json.latitude, json.longitude);
                    } else {
                        console.log('No result from API');
                    }
                });
            }

            console.log('HTML5 geolocation failed/denied. Trying alternate API...');

            var options = config.geoIpOptions;
            options.path = `/json/${server.ip}`;

            var req = http.request(options, callback);
            req.end();
        });

    });

    function logVisit(ip, lat, lon) {

        //emit coordinates to all connected sockets for live update of pages
        io.emit('coords', {lon: lon, lat: lat, ip: server.ip, time: Date.now()});
        io.emit('coords-done');     

        con.query(`INSERT INTO ip_logs (ip_addr, latitude, longitude) VALUES (?, ?, ?)`,
            [ip, lat, lon], function(err) {
                if (err) throw err;
                console.log(`${ip} location logged to database`);
            });
    }
}