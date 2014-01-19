function BWVector (x, y) {
	this.x = x;
	this.y = y;
}

BWVector.prototype.desc = function () {
	return '<x:' + this.x + ' - y:' + this.y + '>';
};

BWVector.prototype.setNorme = function (n) {
	if (this.x != 0 || this.y != 0) {
		var a = this.getAngle();
		this.x = Math.cos(a) * n;
		this.y = Math.sin(a) * n;
	}
};

BWVector.prototype.getNorme = function () {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

BWVector.prototype.increaseAngle = function (a) {
	if (this.x != 0 || this.y != 0) {
		var n = this.getNorme();

		a += this.getAngle();

		this.x = Math.cos(a) * n;
		this.y = Math.sin(a) * n;
	}
};

BWVector.prototype.getAngle = function () {
	var a = 0;

	if (this.x != 0 || this.y != 0)
		a = Math.atan2(this.y, this.x);

	return a;
};

module.exports = BWVector;
