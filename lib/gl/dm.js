module.exports = function (bwd) {
	bwd.tickPlayers();
	bwd.tickRevive();

	bwd.processSBCollisions();
	bwd.processEdgesCollisions();

	bwd.processScoresByKill();

	bwd.sendEntities();
	bwd.sendScores();
};
