module.exports = function (res, cookie, routes) {

	    res.setHeader('Set-Cookie', cookie.serialize('session', '', {
            httpOnly: true,
            secure: true,
            path: routes.root.url,
            expires: new Date(0)
        }));
        res.statusCode = 302;
        res.setHeader('Location', routes.root.url);
        res.end();
}