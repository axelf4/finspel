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
			deps: ["three"],
			exports: "window"
		},
		"three/MaskPass": {
			deps: ["three"],
			exports: "window"
		},
		"three/RenderPass": {
			deps: ["three"],
			exports: "window"
		},
		"three/ShaderPass": {
			deps: ["three"],
			exports: "window"
		},
		"three/DotScreenPass": {
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
			deps: ["three", "three/GlitchPass", "three/MaskPass", "three/RenderPass", "three/ShaderPass", "three/DotScreenPass", "shaders/CopyShader", "shaders/DigitalGlitch", "shaders/DotScreenShader"],
			exports: "window"
		}
	}
});
requirejs(["game"], function(game) {
	console.log("hello");
	game.start();
});
