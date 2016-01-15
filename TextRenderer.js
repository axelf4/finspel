define(["three", "constants"], function(THREE, constants) {
	var TextRenderer = function() {
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");

		this.texture = new THREE.Texture(this.canvas);
		this.texture.magFilter = this.texture.minFilter = THREE.NearestFilter;
		// this.texture.needsUpdate = true;

		this.setSize(constants.virtualWidth, constants.virtualHeight);

		var geometry = new THREE.PlaneGeometry(constants.virtualWidth, constants.virtualHeight);
		var material = new THREE.MeshBasicMaterial({
			map: this.texture,
			transparent: true
		});
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.set(constants.virtualWidth / 2, constants.virtualHeight / 2, 0);

		this.textGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
		this.textGradient.addColorStop("0", "magenta");
		this.textGradient.addColorStop("0.5", "blue");
		this.textGradient.addColorStop("1", "red");
	};

	TextRenderer.prototype.drawEnv = function(callback) {
		this.ctx.clearRect(0, 0, constants.virtualWidth, constants.virtualHeight);
		this.lastCallback = callback;
		if (callback) callback(this.ctx);
		this.texture.needsUpdate = true;
	};

	TextRenderer.prototype.getMesh = function() { return this.mesh; };

	TextRenderer.prototype.getGradient = function() { return this.textGradient; };

	TextRenderer.prototype.setSize = function(width, height) {
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx.scale(width / 800, height / 600);
		this.drawEnv(this.lastCallback);
	};
	return TextRenderer;
});
