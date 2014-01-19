var BWShip = require('./bw_ship.js');

function BWPlayer (ws, id, team, map) {
	this.ws = ws;
	this.id = id;
	this.team = team;
	this.map = map;

	this.nick = this.id + '#pizza_vanille';

	this.events = {
		left: false,
		right: false,
		up: false,
		down: false
	};

	this.killCounter = 0;
	this.deathCounter = 0;
	this.scoreCounter = 0;

	this.alive = true;
	this.reviving = false;

	this.deadTime = 120;
	this.deadTimer = 0;
	
	this.reviveTime = 120;
	this.reviveTimer = 0;

	this.ship = new BWShip(this.randomPosition(), this, this.map);
}

BWPlayer.prototype.setNick = function (newNick) {
	console.log("Changing nick for %s to %s", this.nick, newNick);
	this.nick = newNick;
};

BWPlayer.prototype.setShip = function (newShip) {
	if (newShip) {
		console.log("Changing ship for player #%d to %d", this.id, newShip.type);
		this.ship = new newShip(this.randomPosition(), this, this.map);
	}
};

BWPlayer.prototype.randomPosition = function () {
	return {
		x: Math.floor(Math.random() * this.map.width),
		y: Math.floor(Math.random() * this.map.height)
	};
};

BWPlayer.prototype.processEvents = function () {
	this.ship.directions.h = 0;
	this.ship.directions.v = 0;

	if (this.events.left)		this.ship.directions.h -= 1;
	if (this.events.right)	this.ship.directions.h += 1;
	if (this.events.up)			this.ship.directions.v -= 1;
	if (this.events.down)		this.ship.directions.v += 1;

	this.ship.processDirections();

	if (this.events.shoot)
		this.ship.shootTo(this.events.shoot);
};

BWPlayer.prototype.tick = function () {
	if (this.alive) {
		this.processEvents();

		this.ship.tick();
	}
};

BWPlayer.prototype.reviveTick = function () {
	if (this.alive && this.reviving) {
		this.reviveTimer--;

		this.ship.state.visible = (Math.floor(this.reviveTimer / 15) % 2) == 1;
		
		if (this.reviveTimer == 0)
				this.fullyBackToLife();
	}

	if (this.alive == false) {
		this.deadTimer--;

		if (this.deadTimer == 0)
			this.revive();
	}
};

BWPlayer.prototype.kill = function (bullet) {
	this.killCounter++;

	this.ship.deleteBullet(bullet);
};

BWPlayer.prototype.die = function () {
	this.alive = false;
	this.deathCounter++;

	this.deadTimer = this.deadTime;

	this.ship.bullets.length = 0;
	this.ship.state.visible = false;
	this.ship.state.collidable = false;

	console.log('Player %d died', this.id);
};

BWPlayer.prototype.revive = function () {
	this.alive = true;
	this.reviving = true;

	this.reviveTimer = this.reviveTime;

	this.ship.state.visible = true;
	this.ship.state.collidable = false;

	console.log('Player %d is reviving...', this.id);
};

BWPlayer.prototype.fullyBackToLife = function () {
	this.reviving = false;

	this.ship.state.visible = true;
	this.ship.state.collidable = true;

	console.log('Player %d is back to life', this.id);
};

BWPlayer.prototype.reviveInstantly = function () {
	this.alive = true;
	this.revive = false;

	this.deadTimer = 0;
	this.reviveTimer = 0;

	this.ship.state.collidable = true;
	this.ship.state.visible = true;

	console.log('Player %d revive instantly', this.id);
};

module.exports = BWPlayer;
