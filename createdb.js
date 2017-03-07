var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('ip_logs.db');

db.serialize(function () {
	db.run("CREATE TABLE ip_logs (ip_addr TEXT, lat REAL, lon REAL)");
});

db.close();