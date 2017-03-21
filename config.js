var config = {};
	
config.server = {};
config.mysql = {};


//server configuration settings
config.server.port = 9000;
config.server.hostname = '127.0.0.1';
config.server.rootPath = '/location_app/'; //root application path. for root domain path, set to '/'

//mysql credentials
config.mysql.host = "localhost";
config.mysql.user = "location_app";
config.mysql.password = "l0cat!on";
config.mysql.database = "location_app"; //database name

module.exports = config;

