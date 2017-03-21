 module.exports = function (fs, req, res, routes, cookie, cookies, con, qs) {

    //check for post data
    if(req.method =='POST') {
        var body = '';

        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {

            var json = qs.parse(body);

            //if username/password provided, check against db
            if(json.username && json.password) {

                con.query(`SELECT username FROM users WHERE username=? AND password=?`, 
                    [json.username, json.password], function(err, rows) {

                    if(err) throw err;

                    //if found, set cookie
                    if(rows[0]) {
                        var sessionKey = require('./session.js').storeSession(con);

                        res.setHeader('Set-Cookie', cookie.serialize('session', sessionKey, {
                            httpOnly: true,
                            maxAge: 60*5,
                            secure: true,
                            path: routes.root.url
                        }));
                    }

                    //refresh page
                    redirect(routes.login.url);
                    return;
                        
                });
            } else {
                redirect(routes.login.url);
                return;
            }
        });
        return;
    }

    var session = cookies.session;

    //if user session cookie exists, redirect to admin page, otherwise show login page.
    if(session) {
        con.query(`SELECT session_key FROM sessions WHERE session_key=?`, [session], function (err, rows) {
            if(err) throw err;
            if(rows[0]) {
                redirect(routes.admin.url);
            } else {
                displayLoginPage();
            }
            return;
        });
    } else {
        displayLoginPage();
    }

    function redirect(path) {
        res.statusCode = 302;
        res.setHeader('Location', path);
        res.end();
    }

    function displayLoginPage() {
        fs.readFile(routes.login.localPath, function(err, page) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(page);
            res.end();
        });
    }
}