requirejs.config({
	paths: {
		"THREE": "three",
		"SPE": "SPE.min"
	},
	shim: {
		"fowl": {
			exports: "fowl"
		},
		"stats": {
			exports: "Stats"
		},
		"GPUParticleSystem": {
			deps: ["three"],
			exports: "window"
		},
		"SPE": {
			deps: ["three"],
			exports: "SPE"
		}
	}
});
requirejs(["game"], function(game) {
	console.log("hello");
	game.start();
});
