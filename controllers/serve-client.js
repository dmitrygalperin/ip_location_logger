module.exports = function(fs, res, path) {

    var type = path.endsWith('.css') ? {'Content-Type': 'text/css'} :
        {'Content-Type': 'text/javascript'};

    file = fs.readFileSync(path, 'utf-8');
    res.writeHead(200, type);
    res.write(file);
    res.end();

}
