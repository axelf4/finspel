var Position = function(x, y) {
	this.x = x;
	this.y = y;
};

var LastPosition = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

var Velocity = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

var THREEObject = function(object) {
	this.object = object;
};

var Emitter = function(options, spawnRate) {
	this.options = options;
	this.spawnRate = spawnRate;
};

var Enemy = function() {};

var Lifetime = function(life) {
	this.life = life;
};

var CircleShape = function(radius) {
	this.radius = radius;
};

// TODO rename to Powerup
var PowerupComponent = function(type) {
	this.type = type;
};
