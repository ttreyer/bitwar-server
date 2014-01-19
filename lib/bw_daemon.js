var BWProtocol = require('./bw_protocol.js'),
		BWServer = require('./bw_server.js'),
		BWPlayer = require('./bw_player.js');

var bwp = BWProtocol;

const FPS = 17;// 1000.0 / 60.0;

const GL_DIR = './gl/',
			GL_EXT = '.js';

function BWDaemon (conf) {
	var self = this;

	this.conf = conf;

	this.game_logic = this.loadGameLogic(this.conf.game.type);
	this.bws = new BWServer(this, this.conf.wss);

	this.ships = this.loadShips(this.conf.ships);
	this.players = [];

	this.lastScoresMessage = null;

	this.tick = function () {
		self.fps++;
		self.game_logic(self);
	};
}

BWDaemon.prototype.getShipByType = function (shipType) {
	var ship = null;
	
	for (var i = 0, l = this.ships.length; i < l; i++) {
		if (this.ships[i].type == shipType) {
			ship = this.ships[i];
			break;
		}
	}

	return ship;
};

BWDaemon.prototype.loadShips = function (shipsToLoad) {
	var ships = [];

	for (var i = 0, l = shipsToLoad.length; i < l; i++) {
		ships.push(require('./ships/' + shipsToLoad[i] + '.js'));
	}

	return ships;
};

BWDaemon.prototype.start = function () {
	this.bws.start();
	setInterval(this.tick, FPS);
	// setInterval(this.printFPS, 1000);

	return this;
};

BWDaemon.prototype.loadGameLogic = function (gl_name) {
	var gl_path = GL_DIR + gl_name + GL_EXT;

	console.info('Loading game logic [%s]', gl_path);

	return require(gl_path);
};

BWDaemon.prototype.newPID = function () {
	console.info('Generating pid...');

	var pid = -1;

	do {
		pid = Math.floor(Math.random() * this.conf.game.max_players);
	} while (this.getPlayerIndexById(pid) != -1);

	console.info('Generating pid... Done [%d]', pid);

	return pid;
};

BWDaemon.prototype.getTID = function () {
	if (!this.conf.game.team) return 0;
	console.log('Generating tid...');

	var tid = 0,
			tSizes = [];

	for (var i = 0; i < this.conf.game.max_team; i++)
		tSizes[i] = 0;

	for (var i = 0, l = this.players.length; i < l; i++) {
		tid = this.players[i].team - 1;
		tSizes[tid]++;
	}

	for (var i = 0; i < this.conf.game.max_team; i++) {
		if (tSizes[i] < tSizes[tid])
			tid = i;
	}

	console.info('Generating tid... Done [%d]', tid + 1);

	return tid + 1;
};

BWDaemon.prototype.getPlayerIndexById = function (id) {
	var index = -1;

	for (var i = 0, l = this.players.length; i < l; i++) {
		if (this.players[i].id == id) {
			index = i;
			break;
		}
	}

	return index;
};

BWDaemon.prototype.newPlayer = function (ws) {
	console.info('Creating a new player...');
	var pid = this.newPID(),
			tid = this.getTID(),
			player = new BWPlayer (ws, pid, tid, this.conf.map);

	player.setShip(this.ships[0]);

	this.bws.sendTo(player, bwp.idMessage(pid));
	this.bws.sendTo(player, bwp.mapMessage(this.conf.map));
	this.bws.sendTo(player, bwp.shipsMessage(this.ships));

	this.players.push(player);

	console.info('Creating a new player... [Done]');

	this.sendPlayersInfo();

	return player;
};

BWDaemon.prototype.deconnectPlayer = function (player) {
	var index = this.getPlayerIndexById(player.id);

	this.players.splice(index, 1);

	this.sendPlayersInfo();

	console.log('Player %d has been deleted', player.id);
};

BWDaemon.prototype.getAllEntities = function () {
	var entities = [];

	for (var i = 0, l = this.players.length; i < l; i++) {
		entities.push(this.players[i].ship.getShipEntities());
		entities.push(this.players[i].ship.getBulletsEntities());
	}

	return entities.concat.apply([], entities);
};

BWDaemon.prototype.getAllVisibleEntities = function () {
	var entities = [];

	for (var i = 0, l = this.players.length; i < l; i++) {
		if (this.players[i].ship.state.visible) {
			entities.push(this.players[i].ship.getShipEntities());
		}

		entities.push(this.players[i].ship.getBulletsEntities());
	}

	return entities.concat.apply([], entities);
};

BWDaemon.prototype.getAllShips = function () {
	var ships = [];

	for (var i = 0, l = this.players.length; i < l; i++) {
		ships.push(this.players[i].ship.getShipEntities());
	}

	return ships.concat.apply([], ships);
};

BWDaemon.prototype.getAllBullets = function () {
	var bullets = [];

	for (var i = 0, l = this.players.length; i < l; i++) {
		bullets.push(this.players[i].ship.getBulletsEntities());
	}

	return bullets.concat.apply([], bullets);
};

BWDaemon.prototype.getAliveTeams = function () {
	var alive_players = this.getAlivePlayers();
	var alive_teams = [];

	for (var i = 0, l = alive_players.length; i < l; i++) {
		var team = alive_players[i].team;

		for (var j = 0, m = alive_teams; j < m; j++) {
			if (alive_teams[j] == team) {
				team = -1;
				break;
			}
		}

		if (team != -1)
			alive_teams.push(team);
	}

	return alive_teams;
};

BWDaemon.prototype.getAlivePlayers = function () {
	var alive_players = [];

	for (var i = 0, l = this.players.length; i < l; i++) {
		if (this.players[i].alive)
			alive_players.push(this.players[i]);
	}

	return alive_players;
};

BWDaemon.prototype.tickPlayers = function () {
	for (var i = 0, l = this.players.length; i < l; i++)
		this.players[i].tick();
};

BWDaemon.prototype.tickRevive = function () {
	for (var i = 0, l = this.players.length; i < l; i++)
		this.players[i].reviveTick();
};

BWDaemon.prototype.reviveAll = function () {
	for (var i = 0, l = this.players.length; i < l; i++)
		this.players[i].reviveInstantly();
};

BWDaemon.prototype.processSBCollisions = function () {
	var ships = this.getAllShips(),
			bullets = this.getAllBullets();

	for (var i = 0, l = ships.length; i < l; i++) {
		for (var j = 0, m = bullets.length; j < m; j++) {
			ships[i].doesCollideWithBullet(bullets[j]);
		}
	}
};

BWDaemon.prototype.processEdgesCollisions = function () {
	var entities = this.getAllEntities();

	for (var i = 0, l = entities.length; i < l; i++)
		entities[i].collisionEdge();
};

BWDaemon.prototype.processScoresByKill = function () {
	for (var i = 0, l = this.players.length; i < l; i++)
		this.players[i].scoreCounter = this.players[i].killCounter - this.players[i].deathCounter;
}

BWDaemon.prototype.sendEntities = function () {
	var entities = this.getAllVisibleEntities();

	this.bws.sendTo(this.players, bwp.entitiesMessage(entities));
};

BWDaemon.prototype.sendPlayersInfo = function () {
	var playersMessage = bwp.playersMessage(this.players);

	if (playersMessage.toString('ascii') != this.lastPlayersMessage) {
		console.log('Submitting new players infos');
		this.lastPlayersMessage = playersMessage.toString('ascii');
		this.bws.sendTo(this.players, bwp.playersMessage(this.players));
	}
};

BWDaemon.prototype.sendScores = function () {
	var scoresMessage = bwp.scoresMessage(this.players);

	this.sendPlayersInfo();
	if (scoresMessage.toString('ascii') != this.lastScoresMessage) {
		console.log('Sending new score board');
		this.lastScoresMessage = scoresMessage.toString('ascii');
		this.bws.sendTo(this.players, scoresMessage);
	}
};

module.exports = BWDaemon;
