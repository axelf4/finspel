define(["game"], function(game) {
	var MainMenuState = function(nextState, score) {
		this.nextState = nextState;
		this.score = score;
	};
	MainMenuState.prototype.onEnter = function() {
		var self = this;
		game.textRenderer.drawEnv(function(ctx) {
			ctx.fillStyle = game.textRenderer.getGradient();
			ctx.font = "Bold 36px Verdana";
			ctx.fillText("Avoid bein h4cked and r4aped.", 20, 300);
			ctx.fillText("space to start | f to fullscreen", 60, 350);
			ctx.fillText("your shitty score: " + Math.floor(self.score), 40, 410);
		});
	};
	MainMenuState.prototype.draw = function() {
	};
	MainMenuState.prototype.update = function(dt) {
		if (game.keys[32]) {
			game.stateManager.setScene(new this.nextState);
		}
	};
	return MainMenuState;
});
