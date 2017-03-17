 module.exports = function (fs, req, res, routes, cookie, cookies) {

 	var username = cookies.username;

    if(username) {
        fs.readFile(routes.admin.localPath, function(err, page) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(page);
            res.end();
            return;
        });
    } else {
        res.statusCode = 302;
        res.setHeader('Location', routes.login.localPath);
        res.end();
        return;
    }
}