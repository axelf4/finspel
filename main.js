requirejs.config({
	paths: {
		"fowl": "lib/fowl.min",
		"THREE": "lib/three",
		"three": "lib/three",
		"stats": "lib/stats",
		"GPUParticleSystem": "lib/GPUParticleSystem",
		"SPE": "lib/SPE.min",
		"EffectComposer": "scripts/EffectComposer",
		"firebase": "https://www.gstatic.com/firebasejs/3.4.1/firebase",
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
		"firebase": {
			exports: "firebase"
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

requirejs(["firebase"], function(firebase) {
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyA5n-onyDK-nK_mHZL0bU0ud_kBgY_JJ6I",
		authDomain: "finspel.firebaseapp.com",
		databaseURL: "https://finspel.firebaseio.com",
		storageBucket: "finspel.appspot.com",
		messagingSenderId: "488508002629"
	};
	firebase.initializeApp(config);

	requirejs(["game", "MainMenuState"], function(game, MainMenuState) {
		console.log("hello");
		game.stateManager.setState(new MainMenuState());
		game.update();
	});

});
