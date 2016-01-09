define(["three", "fowl", "stats", "GPUParticleSystem", "spheretest", "EffectComposer"],
		function(THREE, fowl, Stats, GPUParticleSystem, spheretest, effect) {
			var scene = new THREE.Scene();
			// var camera = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -1, 1);
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
			glitchPass = new THREE.GlitchPass();
			glitchPass.renderToScreen = true;
			composer.addPass( glitchPass );

			var keys = {};
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
			window.addEventListener("resize", onResize);
			window.addEventListener("keydown", function(e) {
				keys[e.keyCode] = true;
				if (e.keyCode === 70) renderer.domElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			});
			window.addEventListener("keyup", function(e) {
				keys[e.keyCode] = false;
			});

			var TextRenderer = function() {
				var canvas = document.createElement("canvas");
				canvas.width = virtualWidth;
				canvas.height = virtualHeight;
				this.ctx = canvas.getContext("2d");

				this.texture = new THREE.Texture(canvas);
				this.texture.magFilter = this.texture.minFilter = THREE.NearestFilter;
				// this.texture.needsUpdate = true;
				var geometry = new THREE.PlaneGeometry(virtualWidth, virtualHeight);
				var material = new THREE.MeshBasicMaterial({
					map: this.texture,
					transparent: true
				});
				var mesh = new THREE.Mesh(geometry, material);
				mesh.position.set(virtualWidth / 2, virtualHeight / 2, 0);
				scene.add(mesh);

				this.textGradient = this.ctx.createLinearGradient(0, 0, canvas.width, 0);
				this.textGradient.addColorStop("0", "magenta");
				this.textGradient.addColorStop("0.5", "blue");
				this.textGradient.addColorStop("1", "red");
			};
			TextRenderer.prototype.drawEnv = function(callback) {
				this.ctx.clearRect(0, 0, virtualWidth, virtualHeight);
				callback(this.ctx);
				this.texture.needsUpdate = true;
			};
			TextRenderer.prototype.getGradient = function() { return this.textGradient; };

			var textRenderer = new TextRenderer();

			var generateSprite = function() {
				var canvas = document.createElement( 'canvas' );
				canvas.width = 16;
				canvas.height = 16;

				var context = canvas.getContext( '2d' );
				var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
				gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
				gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
				gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
				gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

				context.fillStyle = gradient;
				context.fillRect( 0, 0, canvas.width, canvas.height );

				return canvas;
			};
			var particleSystem;

			var Position = function(x, y) {
				this.x = x;
				this.y = y;
			};

			var LastPosition = function(x, y) {
				this.x = x || 0;
				this.y = y || 0;
			};

			var Velocity = function(x, y) {
				this.x = x || 0;
				this.y = y || 0;
			};

			var THREEObject = function(object) {
				this.object = object;
			};

			var Emitter = function(options, spawnRate) {
				this.options = options;
				this.spawnRate = spawnRate;
			};

			var Enemy = function() {};

			var Lifetime = function(life) {
				this.life = life;
			};

			fowl.registerComponents(Position, LastPosition, Velocity, THREEObject, Emitter, Enemy, Lifetime);
			var em = new fowl.EntityManager();

			var createPlayer = function() {
				var squareGeometry = new THREE.Geometry();
				squareGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
				squareGeometry.vertices.push(new THREE.Vector3(virtualWidth, 0, 0));
				squareGeometry.vertices.push(new THREE.Vector3(0, virtualHeight, 0));
				squareGeometry.vertices.push(new THREE.Vector3(virtualWidth, virtualHeight, 0));
				squareGeometry.faces.push(new THREE.Face3(0, 1, 2));
				squareGeometry.faces.push(new THREE.Face3(3, 2, 1));

				var squareMaterial = new THREE.MeshBasicMaterial({
					color: 0xFFFFFF
				});
				var squareMesh = new THREE.Mesh(squareGeometry, squareMaterial);
				// scene.add(squareMesh);

				var options = {
					position: new THREE.Vector3(),
					positionRandomness: 1,
					velocity: new THREE.Vector3(10),
					velocityRandomness: 50,
					color: 0xaa88ff,
					colorRandomness: .2,
					turbulence: .5,
					lifetime: 1.5,
					size: 10,
					sizeRandomness: 2
				};

				var player = em.createEntity();
				em.addComponent(player, new Position(virtualWidth / 2, virtualHeight / 2));
				em.addComponent(player, new LastPosition());
				em.addComponent(player, new THREEObject(squareMesh));
				em.addComponent(player, new Emitter(options, 50));
				return player;
			};

			var MOVEMENT_SPEED = 0.4;
			var player;

			var updatePlayer = function(dt) {
				var position = em.getComponent(player, Position);
				if ((keys[65] || keys[37]) && position.x > 0) position.x -= MOVEMENT_SPEED * dt;
				if ((keys[83] || keys[40]) && position.y > 0) position.y -= MOVEMENT_SPEED * dt;
				if ((keys[68] || keys[39]) && position.x < virtualWidth) position.x += MOVEMENT_SPEED * dt;
				if ((keys[87] || keys[38]) && position.y < virtualHeight) position.y += MOVEMENT_SPEED * dt;
			};
			var spawnEnemy = function(x, y, direction, dt) {
				var options = {
					position: new THREE.Vector3(),
					positionRandomness: 50,
					velocity: new THREE.Vector3(),
					// velocityRandomness: 4000,
					velocityRandomness: 0,
					color: 0x1BE215,
					colorRandomness: .2,
					turbulence: 3,
					lifetime: 4,
					size: 50,
					sizeRandomness: 10
				};
				var enemy = em.createEntity();
				em.addComponent(enemy, new Position(x, y));
				em.addComponent(enemy, new LastPosition());
				var speed = 0.165;
				direction = direction * Math.PI / 180;
				em.addComponent(enemy, new Velocity(Math.cos(direction) * speed, Math.sin(direction) * speed));
				em.addComponent(enemy, new Emitter(options, 1));
				em.addComponent(enemy, new Enemy());
				em.addComponent(enemy, new Lifetime(8000));
			};

			var enemyTimer = 0;
			var updateEnemies = function(dt) {
				enemyTimer += dt;
				var enemySpawnRate = 1000;
				if (enemyTimer > enemySpawnRate) {
					if (enemyTimer - enemySpawnRate > enemySpawnRate) console.log("Enemy spawn overflow");
					enemyTimer = 0; // enemyTimer -= enemySpawnRate;
					var x, y, pad = 50;
					pad = 0;
					direction = Math.random() * 360;
					if (direction < 135 && direction >= 45) {
						x = Math.random() * 800;
						y = 0 - pad;
					} else if (direction < 225 && direction >= 135) {
						x = 800 + pad;
						y = Math.random() * 600;
					} else if (direction < 315 && direction >=225) {
						x = Math.random() * 800;
						y = 600 + pad;
					} else {
						x = 0 - pad;
						y = Math.random() * 600;
					}
					spawnEnemy(x, y, direction, dt);
				}
			};
			var updateVelocities = function(dt) {
				em.each(function(entity) {
					var position = em.getComponent(entity, Position),
					lastPosition = em.getComponent(entity, LastPosition),
					velocity = em.getComponent(entity, Velocity);
					lastPosition.x = position.x;
					lastPosition.y = position.y;
					position.x += velocity.x * dt;
					position.y += velocity.y * dt;
				}, Position, Velocity);
			};
			var updatePosition = function(entity) {
					var position = em.getComponent(entity, Position),
					object = em.getComponent(entity, THREEObject);
					object.object.position.set(position.x, position.y, 0);
			};
			var circleIntersection = function(x1, y1, radius1, x2, y2, radius2) {
				var dx = x2 - x1, dy = y2 - y1, radii = radius1 + radius2;
				return dx * dx + dy * dy < radii * radii;
			};
			var detectCollisions = function() {
				var dead = false;
				em.each(function(entity) {
					var r1 = 15;
					var r2 = 18;
					var p1 = em.getComponent(player, Position);
					var p2 = em.getComponent(entity, Position);
					if (circleIntersection(p1.x, p1.y, r1, p2.x, p2.y, r2)) {
						console.log("collision mate");
						dead = true;
					}
				}, Position, Enemy);
				return dead;
			};

			var SceneManager = function(scene) {
				this.setScene(scene);
			};
			SceneManager.prototype.getScene = function() { return this.current; };
			SceneManager.prototype.setScene = function(scene) {
				if (this.current && this.current.onLeave) this.current.onLeave();
				this.current = scene;
				if (scene.onEnter) scene.onEnter();
			};

			var score = 0, oldScore = score;
			var mainMenuScene;
			var gameScene = {
				drawScore: function(score) {
					textRenderer.drawEnv(function(ctx) {
						ctx.fillStyle = textRenderer.getGradient();
						ctx.font = "24px Verdana";
						ctx.fillText("Score: " + Math.floor(score), 0, 580);
					});
				},
				onEnter: function() {
					particleSystem = new THREE.GPUParticleSystem({
						maxParticles: 300000
					});
					scene.add(particleSystem);
					player = createPlayer();
					this.drawScore(score = 0);
				},
				onLeave: function() {
					em.clear();
					scene.remove(particleSystem);
				},
				draw: function() {
				},
				update: function(dt, tick) {
					score += dt / 2000;
					if (score > oldScore + 1) {
						this.drawScore(score);
						oldScore = score;
					}
					updatePlayer(dt);
					updateEnemies(dt);
					updateVelocities(dt);
					em.each(updatePosition, Position, THREEObject);
					if (detectCollisions()) sceneManager.setScene(mainMenuScene);
					em.each(function(entity) {
						var lifetime = em.getComponent(entity, Lifetime);
						lifetime.life -= dt;
						if (lifetime.life <= 0) em.removeEntity(entity);
					}, Lifetime);
					em.each(function(entity) {
						var position = em.getComponent(entity, Position),
						emitter = em.getComponent(entity, Emitter);
					emitter.options.position.x = position.x;
					emitter.options.position.y = position.y;
					var count = Math.min(2000, emitter.spawnRate * dt);
					for (var x = 0; x < count; ++x) particleSystem.spawnParticle(emitter.options);
					}, Position, Emitter);
					particleSystem.update(tick);
				}
			};
			mainMenuScene = {
				onEnter: function() {
					textRenderer.drawEnv(function(ctx) {
						ctx.fillStyle = textRenderer.getGradient();
						ctx.font = "Bold 48px Verdana";
						ctx.fillText("Game Over", 200, 300);
						ctx.fillText("you suck", 200, 350);
						ctx.fillText("your shitty score: " + Math.floor(score), 40, 410);
					});
				},
				draw: function() {
				},
				update: function(dt) {
					if (keys[32]) {
						sceneManager.setScene(gameScene);
					}
				}
			};
			var sceneManager = new SceneManager(mainMenuScene);

			var lastTime, tick = 0;
			var update = function(time) {
				window.requestAnimationFrame(update);
				var dt = time - lastTime;
				lastTime = time;
				if (isNaN(dt)) dt = 0;
				else tick += dt / 1000;
				sceneManager.getScene().update(dt, tick);
				sceneManager.getScene().draw();
				composer.render(); // renderer.render(scene, camera);
				stats.update();
			};

			return {
				update: update,
				start: function() {
					console.log("Hello");
					update();
				}
			};
		});
