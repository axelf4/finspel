define(["game", "firebase", "QueryString"], function(game, firebase, QueryString) {
	// Get a reference to the database service
	var database = firebase.database();
	var scoresRef = database.ref("scores"), topScoresRef = scoresRef.orderByChild("value");

	var GameScoreState = function(nextState, score) {
		this.nextState = nextState;
		this.score = score;

		this.onValueChange = null;
		this.addedHighscore = false;
	};

	GameScoreState.prototype.drawScores = function(results) {
		var self = this;
		if (!(game.stateManager.getState() instanceof GameScoreState)) return;
		game.textRenderer.drawEnv(function(ctx) {
			ctx.fillStyle = game.textRenderer.getGradient();
			ctx.font = "Bold 36px Verdana";
			ctx.fillText("Highscores" + (QueryString.fin ? '' : " beatch"), 140, 100);

			if (results) {
				var y = 200;
				for (var i = 0; i < results.length && i < 5; ++i) {
					var object = results[i];
					ctx.fillText(i + 1 + ". " + object.name + " - " + Math.floor(object.score), 50, y);
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

		this.onValueChange = topScoresRef.on("value", function(snapshot) {
			var highscores = [];
			snapshot.forEach(function(entry) {
				var value = entry.val();
				highscores.push(value);
			});
			// highscores.reverse();
			highscores.sort(function(a, b) { return b.score - a.score; });
			console.log(highscores);

			self.drawScores(highscores);

			if (!self.addedHighscore && (highscores.length < 5 || highscores[4].score < self.score)) {
				self.addedHighscore = true;
				var name = window.prompt("You got on the scoreboard cunt. What is your name, ugly?");
				if (name) {
					var scoreData = {
						"name": name.substring(0, 20),
						"score": self.score
					};
					scoresRef.push().set(scoreData);
				}
			}
		});
	};

	GameScoreState.prototype.onLeave = function() {
		if (!this.onValueChange) throw new Error("this.onValueChange is unexpectedly null.");
		scoresRef.off("value", this.onValueChange);
	};

	GameScoreState.prototype.draw = function() {
	};
	GameScoreState.prototype.update = function(dt) {
		if (game.keys[32]) {
			game.stateManager.setState(new this.nextState);
		}
	};
	return GameScoreState;
});
