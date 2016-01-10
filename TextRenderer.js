define(["three", "constants"], function(THREE, constants) {
	var TextRenderer = function() {
		var canvas = document.createElement("canvas");
		canvas.width = constants.virtualWidth;
		canvas.height = constants.virtualHeight;
		this.ctx = canvas.getContext("2d");

		this.texture = new THREE.Texture(canvas);
		this.texture.magFilter = this.texture.minFilter = THREE.NearestFilter;
		// this.texture.needsUpdate = true;
		var geometry = new THREE.PlaneGeometry(constants.virtualWidth, constants.virtualHeight);
		var material = new THREE.MeshBasicMaterial({
			map: this.texture,
			transparent: true
		});
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.set(constants.virtualWidth / 2, constants.virtualHeight / 2, 0);

		this.textGradient = this.ctx.createLinearGradient(0, 0, canvas.width, 0);
		this.textGradient.addColorStop("0", "magenta");
		this.textGradient.addColorStop("0.5", "blue");
		this.textGradient.addColorStop("1", "red");
	};
	TextRenderer.prototype.drawEnv = function(callback) {
		this.ctx.clearRect(0, 0, constants.virtualWidth, constants.virtualHeight);
		callback(this.ctx);
		this.texture.needsUpdate = true;
	};
	TextRenderer.prototype.getMesh = function() { return this.mesh; };
	TextRenderer.prototype.getGradient = function() { return this.textGradient; };
	return TextRenderer;
});
