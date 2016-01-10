define(["three", "fowl", "stats", "GPUParticleSystem", "spheretest", "EffectComposer", "components", "StateManager", "TextRenderer"],
		function(THREE, fowl, Stats, GPUParticleSystem, spheretest, effect, components, StateManager, TextRenderer) {
			var scene = new THREE.Scene();
			var virtualWidth = 800, virtualHeight = 600, targetAspectRatio = virtualWidth / virtualHeight;
			var camera = new THREE.OrthographicCamera(0, virtualWidth, virtualHeight, 0, -1, 1);
			var renderer = new THREE.WebGLRenderer();
			renderer.setSize(virtualWidth, virtualHeight); // renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setClearColor(0x000000, 1);
			document.body.appendChild(renderer.domElement);
			var stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			document.body.appendChild(stats.domElement);

			var composer = new THREE.EffectComposer(renderer);
			composer.addPass( new THREE.RenderPass( scene, camera ) );
			dotScreenPass = new THREE.DotScreenPass();
			// composer.addPass(dotScreenPass);
			glitchPass = new THREE.GlitchPass();
			glitchPass.renderToScreen = true;
			composer.addPass( glitchPass );

			var onResize = function() {
				var width = window.innerWidth, height = Math.ceil(width / targetAspectRatio);
				if (height > window.innerHeight) {
					height = window.innerHeight;
					width = Math.ceil(height * targetAspectRatio);
				}
				// var x = window.innerWidth / 2 - width / 2, y = window.innerHeight / 2 - height / 2;
				renderer.setSize(width, height); // renderer.setSize(window.innerWidth, window.innerHeight);
			};
			onResize();
			var keys = {};
			window.addEventListener("resize", onResize);
			window.addEventListener("keydown", function(e) {
				keys[e.keyCode] = true;
				if (e.keyCode === 70) renderer.domElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			});
			window.addEventListener("keyup", function(e) {
				keys[e.keyCode] = false;
			});

			fowl.registerComponents(Position, LastPosition, Velocity, THREEObject, Emitter, Enemy, Lifetime);

			var stateManager = new StateManager(), textRenderer = new TextRenderer();
			scene.add(textRenderer.getMesh());

			var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
			var loadAudio = function(path, onload) {
				ajaxRequest = new XMLHttpRequest();
				ajaxRequest.open('GET', path, true);
				ajaxRequest.responseType = 'arraybuffer';

				var self = this;
				ajaxRequest.onload = function() {
					var audioData = ajaxRequest.response;
					audioCtx.decodeAudioData(audioData, function(buffer) {
						var soundSource = audioCtx.createBufferSource();
						soundSource.buffer = buffer;
						onload(soundSource);
					}, function(e) {"Error with decoding audio data" + e.err});
					//soundSource.connect(audioCtx.destination);
					//soundSource.loop = true;
					//soundSource.start();
				}
				ajaxRequest.send();
			};

			var sounds = {};
			loadAudio("resources/Allahu Akbar.wav", function(source) {
				source.connect(audioCtx.destination);
				sounds.dieSound = source;
			});

			var blurred = false;
			window.onblur = function() {
				blurred = true;
			};
			// Set the name of the hidden property and the change event for visibility
			var hidden, visibilityChange;
			if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
				hidden = "hidden";
				visibilityChange = "visibilitychange";
			} else if (typeof document.mozHidden !== "undefined") {
				hidden = "mozHidden";
				visibilityChange = "mozvisibilitychange";
			} else if (typeof document.msHidden !== "undefined") {
				hidden = "msHidden";
				visibilityChange = "msvisibilitychange";
			} else if (typeof document.webkitHidden !== "undefined") {
				hidden = "webkitHidden";
				visibilityChange = "webkitvisibilitychange";
			}

			var lastTime, tick = 0;
			var update = function(time) {
				window.requestAnimationFrame(update);
				var dt = time - lastTime;
				lastTime = time;
				if (document[hidden] || blurred || isNaN(dt)) {
					dt = 0;
					blurred = false;
				} else tick += dt / 1000;
				stateManager.getScene().update(dt, tick);
				stateManager.getScene().draw();
				composer.render(); // renderer.render(scene, camera);
				stats.update();
			};

			return {
				update: update,
					keys: keys,
					scene: scene,
					textRenderer: textRenderer,
					stateManager: stateManager,
					sounds: sounds
			};
		});
