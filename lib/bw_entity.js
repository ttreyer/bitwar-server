var BWVector = require('./bw_vector.js');

function BWEntity (position, player, map) {
	this.type = 0;

	this.player = player;
	this.map = map;

	this.state = {
		collidable: true,
		visible: true
	};

	this.pe = {
		x: position.x,
		y: position.y,
		r: 0
	};

	this.ge = {
		dx: 0,
		dy: 0,
		w: 0,
		h: 0
	};

	this.max_velocity = -1;
	this.min_velocity = -1;
	this.velocity = 0;

	this.acceleration = 0;

	this.directions = {
		h: 0,
		v:0
	};

	this.vector = new BWVector(0, 0);

	this.lp = {
		x: this.pe.x,
		y: this.pe.y
	};
}

BWEntity.prototype.setVelocity = function (v) {
	if (this.min_velocity != -1 && v < this.min_velocity)
		v = this.min_velocity;
	if (this.max_velocity != -1 && v > this.max_velocity)
		v = this.max_velocity;

	this.velocity = v;
	this.vector.setNorme(this.velocity);
};

BWEntity.prototype.tick = function () {
	this.lp.x = this.pe.x;
	this.lp.y = this.pe.y;

	this.pe.x += this.vector.x;
	this.pe.y += this.vector.y;

	this.setVelocity(this.velocity + this.acceleration);
};

BWEntity.prototype.processDirections = function () {
	this.vector.x = this.directions.h;
	this.vector.y = this.directions.v;

	this.vector.setNorme(this.velocity);
};

BWEntity.prototype.collisionEdge = function () {
	if (this.pe.x + this.ge.dx < 0)
		this.pe.x = -this.ge.dx;
	if (this.pe.y + this.ge.dy < 0)
		this.pe.y = -this.ge.dy;
	if (this.pe.x + this.ge.dx + this.ge.w > this.map.width)
		this.pe.x = this.map.width - this.ge.w - this.ge.dx;
	if (this.pe.y + this.ge.dy + this.ge.h > this.map.height)
		this.pe.y = this.map.height - this.ge.h - this.ge.dy;
};

BWEntity.prototype.collisionWith = function (e) {
	if (this.player.id == e.player.id) return false;
	if ((this.state.collidable && e.state.collidable) == false) return false;

	var dx = e.pe.x - this.pe.x,
			dy = e.pe.y - this.pe.y,
			dvx = (e.lp.x - e.pe.x) - (this.lp.x - e.pe.x),
			dvy = (e.lp.y - e.pe.y) - (this.lp.y - e.pe.y);

	var dp = (dx * dx + dy * dy) - (this.pe.r + e.pe.r) * (this.pe.r + e.pe.r);

	if (dp < 0) return true;

	var dv = dvx * dvx + dvy * dvy;

	if (dv < 0) return false;

	var dvp = dvx * dx + dvy * dy;

	if (dvp > 0) return false;

	return (dvp * dvp - dv * dp) >= 0;
};

module.exports = BWEntity;
