requirejs.config({
	paths: {
		"fowl": "lib/fowl",
		"THREE": "lib/three",
		"three": "lib/three",
		"stats": "lib/stats",
		"GPUParticleSystem": "lib/GPUParticleSystem",
		"SPE": "lib/SPE.min",
		"EffectComposer": "scripts/EffectComposer"
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
requirejs(["game", "GameState"], function(game, GameState) {
	console.log("hello");
	game.stateManager.setScene(new GameState());
	game.update();
});
