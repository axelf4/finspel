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
		"EffectComposer": {
			deps: ["three", "three/GlitchPass", "three/MaskPass", "three/RenderPass", "three/ShaderPass", "shaders/CopyShader", "shaders/DigitalGlitch"]
		}
	}
});
requirejs(["game"], function(game) {
	console.log("hello");
	game.start();
});
