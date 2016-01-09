requirejs.config({
	paths: {
		"THREE": "three",
		"SPE": "SPE.min",
		"EffectComposer": "three/EffectComposer"
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
		"three/GlitchPass": {
			deps: ["three"]
		},
		"three/MaskPass": {
			deps: ["three"]
		},
		"three/RenderPass": {
			deps: ["three"]
		},
		"three/ShaderPass": {
			deps: ["three"]
		},
		"shaders/CopyShader": {
			deps: ["three"]
		},
		"shaders/DigitalGlitch": {
			deps: ["three"]
		},
		"EffectComposer": {
			deps: ["three", "three/GlitchPass", "three/MaskPass", "three/RenderPass", "three/ShaderPass", "shaders/CopyShader", "shaders/DigitalGlitch"]
		}
	}
});
requirejs(["game"], function(game) {
	console.log("hello");
	game.start();
});
