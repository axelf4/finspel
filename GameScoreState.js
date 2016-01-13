define(["game", "Parse"], function(game, Parse) {
	var GameScoreState = function(nextState, score) {
		this.nextState = nextState;
		this.score = score;
	};
	GameScoreState.prototype.drawScores = function(results) {
		var self = this;
		game.textRenderer.drawEnv(function(ctx) {
			ctx.fillStyle = game.textRenderer.getGradient();
			ctx.font = "Bold 36px Verdana";
			ctx.fillText("Highscores beatch", 140, 100);

			if (results) {
				var y = 200;
				for (var i = 0; i < results.length; i++) {
					var object = results[i];
					ctx.fillText(i + 1 + ". " + object.get("playerName") + " - " + Math.floor(object.get("score")), 50, y);
					y += 60;
				}
			} else {
				ctx.fillText("Querying scores...", 50, 200);
			}
			ctx.fillText("your shitty score: " + Math.floor(self.score), 40, 510);
		});
	};
	GameScoreState.prototype.onEnter = function() {
		var self = this;
		this.drawScores();
		var query = new Parse.Query(game.GameScore);
		query.limit(5);
		query.descending("score");
		query.find().then(function(results) {
			// alert("Successfully retrieved " + results.length + " scores.");
			// Do something with the returned Parse.Object values
			if (results.length < 5 || results[4].get("score") < self.score) {
				var gameScore = new game.GameScore();
				gameScore.save({
					score: self.score,
					playerName: window.prompt("You got on the scoreboard cunt. What is your name, ugly?").substring(0, 20)
				}).then(function(object) {
					query.find().then(function(results) { self.drawScores(results); });
				});
			} else self.drawScores(results);
		});
	};
	GameScoreState.prototype.draw = function() {
	};
	GameScoreState.prototype.update = function(dt) {
		if (game.keys[32]) {
			game.stateManager.setScene(new this.nextState);
		}
	};
	return GameScoreState;
});
