const https     = require('https');
const fs       = require('fs');
const cookie   = require('cookie');
const qs       = require('querystring');
const mysql    = require('mysql');
const session  = require('./controllers/session');
const config   = require('./config');
const hostname = config.server.hostname;
const port     = config.server.port;
const rootPath = config.server.rootPath;

const routes = {
    clientjs: { url: '/location_app/public/js/locate.js', localPath: 'public/js/locate.js'},
    adminjs:  { url: '/location_app/public/js/admin.js', localPath: 'public/js/admin.js'},
    socket:   { url: '/location_app/public/js/socket.js', localPath: 'public/js/socket.js'},
    css:      { url: '/location_app/public/css/style.css', localPath: 'public/css/style.css'},
    root:     { url: rootPath, localPath: 'public/location.html' },
    login:    { url: '/login', localPath: 'public/login.html' },
    admin:    { url: '/admin', localPath: 'public/admin.html'},
    logout:   { url: '/logout', localPath: ''}
};

const con = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

//generate client-side js specifying socket.io hostname and port
var socketIoClientConfig = `var socketAddress = io().connect('http://${hostname}:${port}');`;

if(fs.existsSync(routes.socket.localPath)) fs.unlinkSync(routes.socket.localPath);

fs.writeFile(routes.socket.localPath, socketIoClientConfig, function(err) {
  if (err) throw err;
});

con.connect(function(err) {
    if(err) {
        console.log(`Connection error: ${err}`);
        return;
    }
    console.log('Connected to MySQL');
});

const server = https.createServer(config.tls, (req, res) => {

    console.log(`Fetching ${req.url}`);

    //get client ip
    exports.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';

    //process ipv6 notation of ipv4 address
    if (this.ip.substr(0, 7) == "::ffff:") {
      this.ip = this.ip.substr(7);
    }

    var cookies = cookie.parse(req.headers.cookie || '');

    //strip trailing slashes
    if(req.url != "/") req.url = req.url.replace(/\/+$/, "");

    switch(req.url) {
        case routes.root.url:
             require('./controllers/index.js')(fs, res, routes);
            break;
        case routes.clientjs.url:
             require('./controllers/serve-client.js')(fs, res, routes.clientjs.localPath);
            break;
        case routes.adminjs.url:
             require('./controllers/serve-client.js')(fs, res, routes.adminjs.localPath);
            break;
        case routes.css.url:
             require('./controllers/serve-client.js')(fs, res, routes.css.localPath);
            break;
        case routes.socket.url:
             require('./controllers/serve-client.js')(fs, res, routes.socket.localPath);
            break;
        case routes.login.url:
             require('./controllers/login.js')(fs, req, res, routes, cookie, cookies, con, qs);
            break;
        case routes.admin.url:
             require('./controllers/admin.js')(fs, res, routes, cookies, con);
            break;
        case routes.logout.url:
             require('./controllers/logout.js')(res, cookie, routes);
            break;
        default:
             require('./controllers/404.js')(res);
            break;
    }
});

var io = require('socket.io').listen(server);

var socketio = require('./controllers/socketio.js')(io, con);

server.listen(port, () => {
    console.log(`Server running at hostname http://${hostname}:${port}/`);
});

//prune sessions every every ten minutes
setInterval(session.pruneSessions, 1000*60*10, con);
