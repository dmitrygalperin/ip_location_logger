module.exports = function(fs, res, routes) {

    script = fs.readFileSync(routes.clientjs.localPath, 'utf-8');
    res.write(script);
    res.end();

}