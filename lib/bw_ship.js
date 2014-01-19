var util = require('util');
		BWEntity = require('./bw_entity.js'),
		BWBullet = require('./bw_bullet.js');

function BWShip (position, player, map) {
	BWEntity.call(this, position, player, map);

	this.type = 11;

	this.pe.r = 1.5;

	this.ge.dx = -6;
	this.ge.dy = -6;
	this.ge.w = 12;
	this.ge.h = 12;

	this.velocity = 6;

	this.ammo = BWBullet;
	this.bullets = [];

	this.bulletTimer = 0;
	this.bulletCooldown = 15;
}

util.inherits(BWShip, BWEntity);

BWShip.prototype.tick = function () {
	this.lp.x = this.pe.x;
	this.lp.y = this.pe.y;

	this.pe.x += this.vector.x;
	this.pe.y += this.vector.y;

	this.setVelocity(this.velocity + this.acceleration);

	this.tickBullets();
};

BWShip.prototype.tickBullets = function () {
	if (this.bulletTimer > 0)
		this.bulletTimer--;

	for (var i = 0, l = this.bullets.length; i < l; i++) {
		this.bullets[i].tick();
	}
};

BWShip.prototype.deleteBullet = function (bullet) {
	for (var i = 0, l = this.bullets.length; i < l; i++) {
		if (this.bullets[i] == bullet) {
			this.bullets.splice(i, 1);
			break;
		}
	}
};

BWShip.prototype.getShipEntities = function () {
	return [this];
};

BWShip.prototype.getBulletsEntities = function () {
	return this.bullets;
};

BWShip.prototype.doesCollideWithBullet = function (e) {
	if (this.player.team != 0 && this.player.team == e.player.team) return false;

	if (this.collisionWith(e)) {
		this.player.die();
		e.player.kill(e);
	}
};

BWShip.prototype.shootTo = function (target) {
	if (this.bulletTimer > 0) return false;

	var bullet = new this.ammo(this.pe, this.player, this.map);

	bullet.setTarget(target);

	this.bullets.push(bullet);

	this.bulletTimer = this.bulletCooldown;
};

module.exports = BWShip;
