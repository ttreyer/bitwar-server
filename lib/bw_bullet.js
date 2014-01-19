var util = require('util'),
		BWEntity = require('./bw_entity.js');

function BWBullet (position, player, map) {
	BWEntity.call(this, position, player, map);

	this.type = 12;

	this.pe.r = 2;

	this.ge.dx = -2;
	this.ge.dy = -2;
	this.ge.w = 4;
	this.ge.h = 4;

	this.velocity = 6.4;
}

util.inherits(BWBullet, BWEntity);

BWBullet.prototype.processDirections = function () {
	if (this.directions.h != 0 ||
			this.directions.v != 0) {
		this.vector.x = this.directions.h;
		this.vector.y = this.directions.v;
	} else {
		this.vector.x =  0;
		this.vector.y = -1;
	}

	this.vector.setNorme(this.velocity);
};

BWBullet.prototype.setTarget = function (target) {
	this.directions.h = target.x - this.pe.x;
	this.directions.v = target.y - this.pe.y;

	this.processDirections();
};

BWBullet.prototype.collisionEdge = function () {
	if (this.pe.x + this.ge.dx < 0 ||
			this.pe.y + this.ge.dy < 0 ||
			this.pe.x + this.ge.dx + this.ge.w > this.map.width ||
			this.pe.y + this.ge.dy + this.ge.h > this.map.height)
		this.player.ship.deleteBullet(this);
};

module.exports = BWBullet;
