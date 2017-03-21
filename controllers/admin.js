 module.exports = function (fs, res, routes, cookies, con) {

 	var session = cookies.session;

    if(session) {
        con.query(`SELECT session_key FROM sessions WHERE session_key=?`, [session], function (err, rows) {
            if(err) throw err;
            if(rows[0]) {
                fs.readFile(routes.admin.localPath, function(err, page) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(page);
                    res.end();
                    return;
                });
            } else {
                redirectToLogin();
            }
        });
    } else {
        redirectToLogin();
        return;
    }

    function redirectToLogin() {
        res.statusCode = 302;
        res.setHeader('Location', routes.login.url);
        res.end();
    }
}