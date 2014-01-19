var util = require('util'),
		BWBullet = require('../bw_bullet.js');

function BetaBullet (position, player, map) {
	BWBullet.call(this, position, player, map);

	this.type = 32;

	this.pe.r = 3;

	this.ge.dx =    -this.pe.r;
	this.ge.dy =    -this.pe.r;
	this.ge.w  = 2 * this.pe.r;
	this.ge.h  = 2 * this.pe.r;

	this.max_velocity = 12;
	this.min_velocity = 0;
	this.velocity			= this.max_velocity;

	this.acceleration = -0.8;
};

util.inherits(BetaBullet, BWBullet);

BWEntity.prototype.tick = function () {
	if (this.velocity <= 0) {
		this.state.collidable = false;
		this.pe.x = -this.pe.r;
		this.pe.y = -this.pe.r;
		return;
	}

	this.lp.x = this.pe.x;
	this.lp.y = this.pe.y;

	this.pe.x += this.vector.x;
	this.pe.y += this.vector.y;

	this.setVelocity(this.velocity + this.acceleration);
};

module.exports = BetaBullet;
