var util = require('util'),
		BaseShip = require('../bw_ship.js');

const BULLET_AMPLITUDE = 32;

function GammaSatellite (parent_ship, offset) {
	BaseShip.call(this, parent_ship.pe, parent_ship.player, parent_ship.map);

	this.pe.r = 4;

	this.ge.dx = -this.pe.r;
	this.ge.dy = -this.pe.r;
	this.ge.w  = 2 * this.pe.r;
	this.ge.h  = 2 * this.pe.r;

	this.parent_ship = parent_ship;
	this.base_offset = offset;
	this.relocate(0);

	this.state.collidable = false;

	this.type = 44;
}

GammaSatellite.type = 44;

util.inherits(GammaSatellite, BaseShip);

GammaSatellite.prototype.relocate = function (offset) {
	var final_offset = (this.base_offset + offset) % (Math.PI * 2);

	this.pe.x = this.parent_ship.pe.x + Math.cos(final_offset) * BULLET_AMPLITUDE;
	this.pe.y = this.parent_ship.pe.y + Math.sin(final_offset) * BULLET_AMPLITUDE;
};

module.exports = GammaSatellite;
