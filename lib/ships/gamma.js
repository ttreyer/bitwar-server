var util = require('util'),
		Vector = require('../bw_vector.js'),
		BaseShip = require('../bw_ship.js'),
		GammaSatellite = require('./gamma_satellite.js'),
		GammaBullet = require('../bullets/gamma.js');

const NB_SATELLITES = 2;

function GammaShip (position, player, map) {
	BaseShip.call(this, position, player, map);

	this.type = GammaShip.type;

	this.ammo = GammaBullet;

	this.bulletCooldown = 8;

	this.satellites_angle = 0;
	this.satellites_delta_angle = Math.PI / 45;
	this.satellites = [];
	for (var i = 0; i < NB_SATELLITES; i++)
		this.satellites.push(new GammaSatellite(this, i * (Math.PI * 2) / NB_SATELLITES));
}

util.inherits(GammaShip, BaseShip);

GammaShip.type = 41;

GammaShip.prototype.getShipEntities = function () {
	return [this].concat(this.satellites);
};

GammaShip.prototype.tick = function () {
	this.lp.x = this.pe.x;
	this.lp.y = this.pe.y;

	this.pe.x += this.vector.x;
	this.pe.y += this.vector.y;

	this.setVelocity(this.velocity + this.acceleration);

	this.satellites_angle = (this.satellites_angle + this.satellites_delta_angle) % (Math.PI * 2 / NB_SATELLITES);
	for (var i = 0, l = this.satellites.length; i < l; i++)
		this.satellites[i].relocate(this.satellites_angle);

	this.tickBullets();
};

GammaShip.prototype.shootTo = function (target) {
	var target_vector = new Vector(target.y - this.pe.y, this.pe.x - target.x);

	this.satellites_angle = target_vector.getAngle();
	for (var i = 0, l = this.satellites.length; i < l; i++)
		this.satellites[i].relocate(this.satellites_angle);

	if (this.bulletTimer > 0) return false;

	var bullet = new this.ammo(this.pe, this.player, this.map);

	bullet.setTarget(target);

	this.bullets.push(bullet);
	
	bullet = new this.ammo(this.pe, this.player, this.map);

	bullet.setTarget(target);
	bullet.t = bullet.sin_frequency;

	this.bullets.push(bullet);

	this.bulletTimer = this.bulletCooldown;
};

module.exports = GammaShip;
