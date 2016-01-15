define([], function() {
	var StateManager = function() {};
	StateManager.prototype.getState = function() { return this.current; };
	StateManager.prototype.setState = function(state) {
		if (this.current && this.current.onLeave) this.current.onLeave();
		this.current = state;
		if (state.onEnter) state.onEnter();
	};
	return StateManager;
});
