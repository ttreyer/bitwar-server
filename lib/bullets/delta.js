var util = require('util'),
		BWVector = require('../bw_vector.js'),
		BWBullet = require('../bw_bullet.js');

function DeltaBullet (shift_max, position, player, map) {
	BWBullet.call(this, position, player, map);

	this.t = 0;

	this.velocity = 8;

	this.shift_timer = 10;
	this.shift_vector = new BWVector(0, 0);
	this.shift_max = shift_max;
}

util.inherits(DeltaBullet, BWBullet);

DeltaBullet.prototype.tick = function () {
	this.lp.x = this.pe.x;
	this.lp.y = this.pe.y;

	if (this.t < this.shift_timer) {
		this.pe.x -= this.shift_vector.x;
		this.pe.y -= this.shift_vector.y;

		this.shift_vector.x = -this.vector.y;
		this.shift_vector.y =  this.vector.x;
		this.shift_vector.setNorme(this.shift_max * Math.sin(Math.PI * this.t / (2 * this.shift_timer)));

		this.pe.x += this.shift_vector.x;
		this.pe.y += this.shift_vector.y;

		this.t++;
	} else {
		this.pe.x += this.vector.x;
		this.pe.y += this.vector.y;
	}
};

module.exports = DeltaBullet;
