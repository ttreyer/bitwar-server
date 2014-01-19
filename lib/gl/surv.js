module.exports = function (bwd) {
	bwd.tickPlayers();

	bwd.processSBCollisions();
	bwd.processEdgesCollisions();

//	bwd.processScoresByKill();

	var aliveTeams = bwd.getAliveTeams();
	if (aliveTeams.length == 1 && bwd.players.length > 1) {
		for (var i = 0, l = bwd.players.length; i < l; i++) {
			if (bwd.players[i].team == aliveTeams[0]) {
				bwd.players[i].scoreCounter += 10;
			}
		}

		bwd.reviveAll();
	}

	bwd.sendEntities();
	bwd.sendScores();
};
