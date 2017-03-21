var http   = require('http');
var config = require('./config');
var mysql  = require("mysql");

var addSampleData = false;
if(process.argv[2] == '--import-sample-data') addSampleData = true;


var con = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

var ip;
var counter = 1;

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

if(addSampleData) {
    con.query(`LOAD DATA LOCAL INFILE 'sampledataset.csv' 
        INTO TABLE ip_logs 
        FIELDS TERMINATED BY ',' 
        LINES TERMINATED BY '\n' 
        IGNORE 1 LINES 
        (id, ip_addr, time)`, function(err) {
            if(err) throw err;
            console.log('sample data imported successfully');
        });

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
                        var coords = JSON.stringify({lat: json.lat, lon: json.lon});
                        console.log(`[${counter}/1000] ip-api.com returned: ${coords}`);

                        con.query(`UPDATE ip_logs
                            SET latitude = ?, longitude = ? 
                            WHERE ip_addr = ?`, [json.lat, json.lon, ip], function (err) {
                                if(err) throw err;
                            });
                    } else {
                        console.log(`[${counter}/1000] No result from ip-api.com`);
                    }

                    counter++;
                    if(counter > 1000) {
                        con.end(function(err) {
                            if(err) throw err;
                            console.log('Database setup completed successfully.');
                        }); 
                    }
                });
            }

    con.query(`SELECT * FROM ip_logs`, function(err, rows) {

        var i = 0, iterations = rows.length;

        function getSampleDataCoords() {
            ip = rows[i].ip_addr;

            var options = {
                hostname: 'www.ip-api.com',
                port: '80',
                path: `/json/${ip}`
            };

            var req = http.request(options, callback);
            req.end();
            i++;
            if(i < iterations) {
                setTimeout(getSampleDataCoords, 410);
            }
        }
        getSampleDataCoords();
    });
}

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

if(!addSampleData) {
    con.end(function(err) {
        if(err) throw err;
        console.log('Database setup completed successfully.');
    });
}