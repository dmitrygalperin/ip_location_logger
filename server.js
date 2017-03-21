const http     = require('http');
const fs       = require('fs');
const cookie   = require('cookie');
const qs       = require('querystring');
const mysql    = require('mysql');
const session  = require('./controllers/session.js');
const config   = require('./config');

const hostname = config.server.hostname;
const port     = config.server.port;
const rootPath = config.server.rootPath;

const routes = {
    clientjs: { url: '/location_app/static/locate.js', localPath: 'static/locate.js'},
    adminjs:  { url: '/location_app/static/js/admin.js', localPath: 'static/js/admin.js'},
    css:      { url: '/location_app/static/css/style.css', localPath: 'static/css/style.css'},
    root:     { url: rootPath, localPath: 'static/location.html' },
    login:    { url: rootPath.concat('login/'), localPath: 'static/login.html' },
    admin:    { url: rootPath.concat('admin/'), localPath: 'static/admin.html'},
    logout:   { url: rootPath.concat('logout/'), localPath: ''}
};

const con = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

con.connect(function(err) {
    if(err) {
        console.log(`Connection error: ${err}`);
        return;
    }
    console.log('Connected to MySQL');
});

const server = http.createServer((req, res) => {

    console.log(`Fetching ${req.url}`);

    //get client ip from http header
    exports.ip = req.headers['x-forwarded-for'];

    var cookies = cookie.parse(req.headers.cookie || '');
    var controller;

    switch(req.url) {
        case routes.root.url:
            controller = require('./controllers/index.js')(fs, res, routes);
            break;
        case routes.clientjs.url:
            controller = require('./controllers/serve-client.js')(fs, res, routes.clientjs.localPath);
            break;
        case routes.adminjs.url:
            controller = require('./controllers/serve-client.js')(fs, res, routes.adminjs.localPath);
            break;
        case routes.css.url:
            controller = require('./controllers/serve-client.js')(fs, res, routes.css.localPath);
            break;
        case routes.login.url:
            controller = require('./controllers/login.js')(fs, req, res, routes, cookie, cookies, con, qs);
            break;
        case routes.admin.url:
            controller = require('./controllers/admin.js')(fs, res, routes, cookies, con);
            break;
        case routes.logout.url:
            controller = require('./controllers/logout.js')(res, cookie, routes);
            break;
        default:
            controller = require('./controllers/404.js')(res);
            break;
    }
});

var io = require('socket.io').listen(server);

var socketio = require('./controllers/socketio.js')(io, con);

server.listen(port, hostname, () => {
    console.log(`Server running at hostname http://${hostname}:${port}/`);
});

setInterval(session.pruneSessions, 1000*60*10, con);