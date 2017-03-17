module.exports = function (res) {
	console.log('Requested page not found. Showing 404.');
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write("404. Not Found");
    res.end();
}