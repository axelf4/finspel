define(["game", "GameState"], function(game, GameState) {
	var MainMenuState = function() {
	};
	MainMenuState.prototype.onEnter = function() {
		var self = this;
		game.textRenderer.drawEnv(function(ctx) {
			ctx.fillStyle = game.textRenderer.getGradient();
			ctx.font = "Bold 36px Verdana";
			ctx.fillText("Avoid bein h4cked and r4aped.", 20, 300);
			ctx.fillText("space to start | f to fullscreen", 60, 350);
		});
	};
	MainMenuState.prototype.draw = function() {
	};
	MainMenuState.prototype.update = function(dt) {
		if (game.keys[32]) {
			game.stateManager.setScene(new GameState());
		}
	};
	return MainMenuState;
});
