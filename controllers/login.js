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

                        res.setHeader('Set-Cookie', cookie.serialize('username', String(rows[0].username), {
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

    var username = cookies.username;

    //if user session cookie exists, redirect to admin page, otherwise show login page.
    if(username) {
        redirect(routes.admin.url);
    } else {
        fs.readFile(routes.login.localPath, function(err, page) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(page);
            res.end();
        });
    }

    function redirect(path) {
        res.statusCode = 302;
        res.setHeader('Location', path);
        res.end();
    }
}