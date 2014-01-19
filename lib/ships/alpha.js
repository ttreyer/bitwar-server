var util = require('util'),
		BaseShip = require('../bw_ship.js'),
		Bullet = require('../bw_bullet.js');

function AlphaShip (position, player, map) {
	BaseShip.call(this, position, player, map);

	this.type = AlphaShip.type;

	this.ammo = Bullet;

	// this.bulletCooldown = 18;
	this.bulletCooldown = 12;

	this.bulletsDeltaAngle = Math.PI / 9;
	this.bulletsPerShoot = 3;
}

util.inherits(AlphaShip, BaseShip);

AlphaShip.type = 21;

AlphaShip.prototype.shootTo = function (target) {
	if (this.bulletTimer > 0) return false;

	var middle = Math.floor(this.bulletsPerShoot / 2),
			angleOffset = (this.bulletsPerShoot % 2) ? 0 : this.bulletsDeltaAngle / 2;

	for (var i = 0; i < this.bulletsPerShoot; i++) {
		var bullet = new this.ammo(this.pe, this.player, this.map);

		bullet.setTarget(target);
		bullet.vector.increaseAngle((middle - i) * this.bulletsDeltaAngle - angleOffset);

		this.bullets.push(bullet);
	}

	this.bulletTimer = this.bulletCooldown;
};

module.exports = AlphaShip;
