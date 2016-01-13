requirejs.config({
	paths: {
		"fowl": "lib/fowl.min",
		"THREE": "lib/three",
		"three": "lib/three",
		"stats": "lib/stats",
		"GPUParticleSystem": "lib/GPUParticleSystem",
		"SPE": "lib/SPE.min",
		"EffectComposer": "scripts/EffectComposer",
		"Parse": "http:" + "//www.parsecdn.com/js/parse-1.6.14.min"
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
		},
		"scripts/GlitchPass": {
			deps: ["three"],
			exports: "window"
		},
		"scripts/MaskPass": {
			deps: ["three"],
			exports: "window"
		},
		"scripts/RenderPass": {
			deps: ["three"],
			exports: "window"
		},
		"scripts/ShaderPass": {
			deps: ["three"],
			exports: "window"
		},
		"scripts/DotScreenPass": {
			deps: ["three"],
			exports: "window"
		},
		"shaders/CopyShader": {
			deps: ["three"],
			exports: "window"
		},
		"shaders/DigitalGlitch": {
			deps: ["three"],
			exports: "window"
		},
		"shaders/DotScreenShader": {
			deps: ["three"],
			exports: "window"
		},
		"EffectComposer": {
			deps: ["three", "scripts/GlitchPass", "scripts/MaskPass", "scripts/RenderPass", "scripts/ShaderPass", "scripts/DotScreenPass", "shaders/CopyShader", "shaders/DigitalGlitch", "shaders/DotScreenShader"],
			exports: "window"
		},
		"components": {
			exports: "window"
		}
	}
});
requirejs(["game", "MainMenuState", "Parse"], function(game, MainMenuState, Parse) {
	console.log("hello");
	Parse.initialize("meS7bwISCH95qPABwjHjUqMlYfLdE5NNVK0XqcIJ", "BZbTgFC42J0yLQxsYpQwz4TQ6CMKvlCQKxWkSk3z");
	game.stateManager.setScene(new MainMenuState());
	game.update();
});
