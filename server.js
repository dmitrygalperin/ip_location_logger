const http = require('http');
const fs = require('fs');
var cookie = require('cookie');

var mysql = require('mysql');
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

var qs = require('querystring');

const hostname = '127.0.0.1';
const port= 9000;

//paths to static content and ajax calls
const rootPath = '/location_app/';
const jsPath = 'static/locate.js';
const locationHtmlPath = 'static/location.html';
const loginHtmlPath = 'static/login.html';
const adminHtmlPath = 'static/admin.html';

const ipApiPath = 'get_coords/';
const logIpPath = 'log_ip/';
const loginPath = 'login/';
const adminPath = 'admin/';
const logoutPath = 'logout/';

const routes = {
    root: { url: rootPath, localPath: 'static/location.html' },
    clientjs: { url: rootPath.concat('static/locate.js'), localPath: 'static/locate.js'},
    login: { url: rootPath.concat('login/'), localPath: 'static/login.html' },
    admin: { url: rootPath.concat('admin/'), localPath: 'static/admin.html'},
    logout: { url: rootPath.concat('logout/'), localPath: ''}
};

const server = http.createServer((req, res) => {

    console.log(`Fetching ${req.url}`);

    //get client ip from http header
    exports.ip = req.headers['x-forwarded-for'];
    var cookies = cookie.parse(req.headers.cookie || '');
    var controller;

    switch(req.url) {
        case routes.root.url:
            controller = require('./controllers/index.js')(fs, req, res, routes);
            break;
        case routes.clientjs.url:
            controller = require('./controllers/serve-client.js')(fs, res, routes);
            break;
        //case routes.ipApi.url:
            //send websocket instead of ajax. must refactor.
            //controller = require('./controllers/ipapi.js')(req, res, routes, ip);
            //break;
        case routes.login.url:
            controller = require('./controllers/login.js')(fs, req, res, routes, cookie, cookies, con, qs);
            break;
        case routes.admin.url:
            controller = require('./controllers/admin.js')(fs, req, res, routes, cookie, cookies);
            break;
        case routes.logout.url:
            controller = require('./controllers/logout.js')(res, cookie, routes);
            break;
        default:
            controller = require('./controllers/404.js')(res);
            break;
    }




   
    
});


function logVisit(ip, lat, lon) {

    io.emit('coords', {lon: lon, lat: lat});        

    con.query(`INSERT INTO ip_logs (ip_addr, latitude, longitude) VALUES (?, ?, ?)`,
        [ip, lat, lon], function(err) {
            if (err) throw err;
            console.log(`${ip} location logged to database`);
        });
}

var io = require('socket.io').listen(server);

var socketio = require('./controllers/socketio.js')(io, con);

server.listen(port, hostname, () => {
    console.log(`Server running at hostname http://${hostname}:${port}/`);
});