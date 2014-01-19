var util = require('util'),
		AlphaShip = require('./alpha.js'),
		BetaBullet = require('../bullets/beta.js');

function BetaShip (position, player, map) {
	AlphaShip.call(this, position, player, map);

	this.type = BetaShip.type;

	this.ammo = BetaBullet;

	this.velocity = 7;

	this.bulletCooldown = 6;

	// this.bulletsDeltaAngle = Math.PI / 9;
	this.bulletsDeltaAngle = Math.PI / 12;
	// this.bulletsPerShoot = 5;
	this.bulletsPerShoot = 7;
}

util.inherits(BetaShip, AlphaShip);

BetaShip.type = 31;

module.exports = BetaShip;
