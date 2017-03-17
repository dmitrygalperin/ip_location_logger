var mysql = require("mysql");

var con = mysql.createConnection({
	host: "localhost",
	user: "location_app",
	password: "l0cat!on",
	database: "location_app"
});

con.connect(function(err) {
	if(err) {
		console.log(`Connection error: ${err}`);
		return;
	}

	console.log('Connected to MySQL');
});


con.query(`CREATE TABLE ip_logs (
	id int(11) NOT NULL AUTO_INCREMENT,
	ip_addr varchar(39) NOT NULL,
	latitude varchar(50),
	longitude varchar(50),
	time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
	) DEFAULT CHARSET=utf8`, function(err) {
		if(err) throw err;

		console.log('ip_logs table created successfully.');
	});

con.query(`CREATE TABLE users (
	id int(11) NOT NULL AUTO_INCREMENT, 
	username varchar(20) NOT NULL, 
	password varchar(20) NOT NULL, 
	PRIMARY KEY (id)
	) DEFAULT CHARSET=utf8;`, function(err) {
		if(err) throw err;

		console.log('users table created successfully.');
	});

con.query(`INSERT INTO users (username, password) VALUES ('admin', 'password');`, function(err) {
	if(err) throw err;

	console.log('default user created with username: "admin", password: "password"');
});

con.end(function(err) {
	if(err) throw err;
	console.log('MyQL connection closed.');
});	