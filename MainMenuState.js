define(["game", "GameState", "QueryString"], function(game, GameState, QueryString) {
	var MainMenuState = function() {
	};
	MainMenuState.prototype.onEnter = function() {
		var self = this;
		game.textRenderer.drawEnv(function(ctx) {
			ctx.fillStyle = game.textRenderer.getGradient();
			ctx.font = "Bold 36px Verdana";
			ctx.fillText("Avoid bein h4cked" + (QueryString.fin ? '' : " and r4aped."), 20, 300);
			ctx.fillText("space to start | f to fullscreen", 60, 350);
		});
	};
	MainMenuState.prototype.draw = function() {
	};
	MainMenuState.prototype.update = function(dt) {
		if (game.keys[32]) {
			game.stateManager.setState(new GameState());
		}
	};
	return MainMenuState;
});
