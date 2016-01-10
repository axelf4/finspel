define([], function() {
	var StateManager = function() {};
	StateManager.prototype.getScene = function() { return this.current; };
	StateManager.prototype.setScene = function(scene) {
		if (this.current && this.current.onLeave) this.current.onLeave();
		this.current = scene;
		if (scene.onEnter) scene.onEnter();
	};
	return StateManager;
});
