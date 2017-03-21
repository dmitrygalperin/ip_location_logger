var latestSessionId = 0;

module.exports = {

	genSessionKey: function () {
		var sessionKey = require('crypto').createHash('md5').update(Date.now().toString()).digest("hex");
		return sessionKey;
	},

	storeSession: function (con) {

		var sessionKey = this.genSessionKey();

		con.query(`INSERT INTO sessions (session_key) VALUES (?)`, [sessionKey], function(err) {
			if(err) throw err;
		});

		return sessionKey;
	},

	pruneSessions: function (con) {

		con.query('DELETE FROM sessions WHERE id<=?', [latestSessionId], function(err) {
			if(err) throw err;
		});

		con.query(`SELECT MAX(id) AS LatestSession FROM sessions`, function(err, rows) {
			if(err) throw err;
			latestSessionId = rows[0].LatestSession;
		});
	}
};