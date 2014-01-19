const ASSASSINS_TEAM = 1,
			TARGET_TEAM = 2;

function AssassinsMode () {
	var self = this;

	this.bwd = null;

	this.targetId = -1;
	this.time = 0;

	this.tick = function (bwd) {
		self.bwd = bwd;

		if (self.bwd.players.length == 0) return;

		if (bwd.getPlayerIndexById(self.targetId) == -1)
			self.startNewGame();

		self.manageNewPlayer();
		
		bwd.tickPlayers();
		
		bwd.processSBCollisions();
		bwd.processEdgesCollisions();

		self.checkVictory();

		bwd.sendEntities();
		bwd.sendScores();

		self.time++;
	};
};

AssassinsMode.prototype.startNewGame = function () {
	console.log('Starting a new game...');

	this.bwd.reviveAll();

	this.resetTeam();
	this.selectANewTarget();

	this.time = 0;

	console.log('Starting a new game... [Done]');
};

AssassinsMode.prototype.resetTeam = function () {
	for (var i = 0, l = this.bwd.players.length; i < l; i++)
		this.bwd.players[i].team = ASSASSINS_TEAM;
};

AssassinsMode.prototype.selectANewTarget = function () {
	if (this.bwd.players.length == 0) return;

	var targetIndex = Math.floor(Math.random() * this.bwd.players.length);

	this.bwd.players[targetIndex].team = TARGET_TEAM;

	this.targetId = this.bwd.players[targetIndex].id;
};

AssassinsMode.prototype.manageNewPlayer = function () {
	for (var i = 0, l = this.bwd.players.length; i < l; i++) {
		if (this.bwd.players[i].team == 0)
			this.bwd.players[i].team = ASSASSINS_TEAM;
	}
};

AssassinsMode.prototype.checkVictory = function () {
	this.checkTargetVictory();
	this.checkAssassinsVictory();
};

AssassinsMode.prototype.numberOfAssassins = function () {
	var assassins = 0;

	for (var i = 0, l = this.bwd.players.length; i < l; i++) {
		if (this.bwd.players[i].team == ASSASSINS_TEAM &&
				this.bwd.players[i].alive == true)
			assassins++;
	}

	return assassins;
};

AssassinsMode.prototype.checkTargetVictory = function () {
	if ((this.time >= this.bwd.conf.game.time ||
			 this.numberOfAssassins() == 0) &&
			this.bwd.players.length > 1) {
		console.log('Target win');
		this.startNewGame();
	}
};

AssassinsMode.prototype.checkAssassinsVictory = function () {
	var targetIndex = this.bwd.getPlayerIndexById(this.targetId),
			target = this.bwd.players[targetIndex];

	if (target && target.alive == false) {
		console.log('Assassins win');
		this.startNewGame();
	}
};

module.exports = new AssassinsMode().tick;
