
module.exports = function (fs, req, res, routes) {
	fs.readFile(routes.root.localPath, function(err, page) {
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    res.write(page);
	    res.end();
	});
}