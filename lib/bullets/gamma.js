var util = require('util'),
		BWVector = require('../bw_vector.js'),
		BWBullet = require('../bw_bullet.js');

function GammaBullet (position, player, map) {
	BWBullet.call(this, position, player, map);

	this.t = 0;

	this.velocity = 8;

	this.sin_vector = new BWVector(0, 0);
	this.sin_frequency = 10;
	this.sin_amplitude = 32;
}

util.inherits(GammaBullet, BWBullet);

GammaBullet.prototype.tick = function () {
	this.lp.x = this.pe.x;
	this.lp.y = this.pe.y;

	this.pe.x -= this.sin_vector.x;
	this.pe.y -= this.sin_vector.y;

	this.pe.x += this.vector.x;
	this.pe.y += this.vector.y;

	this.sin_vector.x = -this.vector.y;
	this.sin_vector.y =  this.vector.x;

	this.sin_vector.setNorme(this.sin_amplitude * Math.cos(this.t++ * Math.PI / this.sin_frequency));

	this.pe.x += this.sin_vector.x;
	this.pe.y += this.sin_vector.y;

	this.setVelocity(this.velocity + this.acceleration);
};

module.exports = GammaBullet;
