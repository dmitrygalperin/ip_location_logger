module.exports = function(fs, res, path) {

    script = fs.readFileSync(path, 'utf-8');
    res.write(script);
    res.end();

}