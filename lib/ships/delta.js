var util = require('util'),
		BaseShip = require('../bw_ship.js'),
		Bullet = require('../bullets/delta.js');

function DeltaShip (position, player, map) {
	BaseShip.call(this, position, player, map);

	this.type = DeltaShip.type;

	this.ammo = Bullet;

	this.bulletCooldown = 10;

	this.bulletsPerShoot = 10;

	this.shift_max = 20;

	this.shift_step = this.shift_max * 2 / (this.bulletsPerShoot - 1);
}

util.inherits(DeltaShip, BaseShip);

DeltaShip.type = 51;

DeltaShip.prototype.shootTo = function (target) {
	if (this.bulletTimer > 0) return false;

	for (var i = 0; i < this.bulletsPerShoot; i++) {
		var shift  = -this.shift_max + i * this.shift_step,
				bullet = new this.ammo(shift, this.pe, this.player, this.map);

		bullet.setTarget(target);

		this.bullets.push(bullet);
	}

	this.bulletTimer = this.bulletCooldown;
};

module.exports = DeltaShip;
