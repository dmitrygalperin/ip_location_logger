const fs = require('fs');

var config = {};

config.server = {};
config.mysql = {};
config.tls = {};

config.tls.key = fs.readFileSync('privkey.pem');
config.tls.cert =fs.readFileSync('fullchain.pem');

config.server.port = 4201;
config.server.hostname = 'dgalper.in';
config.server.rootPath = '/';

//mysql credentials
config.mysql.host = "localhost";
config.mysql.user = "location_app";
config.mysql.password = "P@SSW0RD";
config.mysql.database = "location_app";


/*freegeoip open source IP geolocation API hosted at
http://freegeoip.net

Github repository: https://github.com/fiorix/freegeoip
BSD 3-Clause license: https://github.com/fiorix/freegeoip/blob/master/LICENSE
*/
config.geoIpOptions = {
    hostname: 'freegeoip.net',
    port: '80',
    path: '/json/'
};

module.exports = config;
