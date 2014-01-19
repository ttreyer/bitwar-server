var WS = require('ws'),
		WSServer = WS.Server;

function BWServer (bwd, conf) {
	var self = this;

	this.bwd = bwd;

	this.conf = conf;
	this.wss = new WSServer(this.conf);

	this.onConnect = function (ws) {
		console.info('A new player has connected...');

		var player = self.bwd.newPlayer(ws);

		ws.on('message', function (data) {
			var message = JSON.parse(data);

			if (message.type == 'events') {
				player.events = message.events;
			} else if (message.type == 'ship') {
				player.setShip(self.bwd.getShipByType(message.ship));
			} else if (message.type == 'nick') {
				player.setNick(message.nick);
			}
		});

		ws.on('close', function () {
			console.info('A player has disconnected');
			self.bwd.deconnectPlayer(player);
		});
	};
}

BWServer.prototype.start = function () {
	this.wss.on('connection', this.onConnect);
};

BWServer.prototype.sendTo = function (players, message) {
	if (!Array.isArray(players))
		players = [players];

	for (var i = 0, l = players.length; i < l; i++) {
		if (players[i].ws.readyState == WS.OPEN)
			players[i].ws.send(message, { binary: true });
	};
};

module.exports = BWServer;
