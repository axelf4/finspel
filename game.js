define(["three", "fowl", "stats", "GPUParticleSystem", "spheretest"],
		function(THREE, fowl, Stats, GPUParticleSystem, spheretest) {
			var scene = new THREE.Scene();
			// var camera = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -1, 1);
			var virtualWidth = 800, virtualHeight = 600, targetAspectRatio = virtualWidth / virtualHeight;
			var camera = new THREE.OrthographicCamera(0, virtualWidth, virtualHeight, 0, -1, 1);
			var renderer = new THREE.WebGLRenderer();
			// renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setClearColor(0x000000, 1);
			document.body.appendChild(renderer.domElement);
			var stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			document.body.appendChild(stats.domElement);
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
			var particleSystem = new THREE.GPUParticleSystem({
				maxParticles: 700000
			});
			scene.add(particleSystem);

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
				squareGeometry.vertices.push(new THREE.Vector3(100, 0, 0));
				squareGeometry.vertices.push(new THREE.Vector3(0, 100, 0));
				squareGeometry.vertices.push(new THREE.Vector3(100, 100, 0));
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
				em.addComponent(player, new Position(0, 0));
				em.addComponent(player, new LastPosition());
				em.addComponent(player, new Velocity());
				em.addComponent(player, new THREEObject(squareMesh));
				em.addComponent(player, new Emitter(options, 50));
				return player;
			};

			var MOVEMENT_SPEED = 0.4;
			var player = createPlayer();

			var updatePlayer = function(dt) {
				var position = em.getComponent(player, Position);
				var v = em.getComponent(player, Velocity);
				if ((keys[65] || keys[37]) && position.x > 0) v.x -= MOVEMENT_SPEED;
				if ((keys[83] || keys[40]) && position.y > 0) v.y -= MOVEMENT_SPEED;
				if ((keys[68] || keys[39]) && position.x < virtualWidth) v.x += MOVEMENT_SPEED;
				if ((keys[87] || keys[38]) && position.y < virtualHeight) v.y += MOVEMENT_SPEED;
				v.x = Math.max(-MOVEMENT_SPEED, Math.min(v.x, MOVEMENT_SPEED));
				v.y = Math.max(-MOVEMENT_SPEED, Math.min(v.y, MOVEMENT_SPEED));
				var nx = position.x + v.x * dt, ny = position.y + v.y * dt;
				if (nx > 0 && nx < virtualWidth) position.x += v.x * dt;
				if (ny > 0 && ny < virtualHeight) position.y += v.y * dt;
				v.x = 0;
				v.y = 0;
			};
			var spawnEnemy = function(x, y, direction, dt) {
				var options = {
					position: new THREE.Vector3(),
					positionRandomness: 50,
					velocity: new THREE.Vector3(),
					velocityRandomness: 4000,
					color: 0x7C0A02,
					colorRandomness: .2,
					turbulence: 3,
					lifetime: 4,
					size: 20,
					sizeRandomness: 10
				};
				var enemy = em.createEntity();
				em.addComponent(enemy, new Position(x, y));
				em.addComponent(enemy, new LastPosition());
				var speed = 0.165;
				direction = direction * Math.PI / 180;
				em.addComponent(enemy, new Velocity(Math.cos(direction) * speed, Math.sin(direction) * speed));
				em.addComponent(enemy, new Emitter(options, 5));
				em.addComponent(enemy, new Enemy());
				em.addComponent(enemy, new Lifetime(8000));
			};

			var enemyTimer = 0;
			var updateEnemies = function(dt) {
				enemyTimer += dt;
				var enemySpawnRate = 1000;
				while (enemyTimer > enemySpawnRate) {
					enemyTimer -= enemySpawnRate;
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
				em.each(function(entity) {
					var r1 = 15;
					var r2 = 15;
					var p1 = em.getComponent(player, Position);
					var p2 = em.getComponent(entity, Position);
					if (circleIntersection(p1.x, p1.y, r1, p2.x, p2.y, r2)) {
						console.log("collision mate");
						alert("you dead");
					}
				}, Position, Enemy);
			};

			var draw = function() {
				renderer.render(scene, camera);
			};

			var lastTime, tick = 0;
			var update = function(time) {
				window.requestAnimationFrame(update);
				var dt = time - lastTime;
				lastTime = time;
				if (isNaN(dt)) dt = 0;
				else tick += dt / 1000;
				updatePlayer(dt);
				updateEnemies(dt);
				updateVelocities(dt);
				em.each(updatePosition, Position, THREEObject);
				detectCollisions();
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
					for (var x = 0; x < emitter.spawnRate * dt; ++x) particleSystem.spawnParticle(emitter.options);
				}, Position, Emitter);
				particleSystem.update(tick);
				draw();
				stats.update();
			};

			return {
				update: update,
				start: function() {
					console.log("Hello");
					update();
				},
				draw: draw
			};
		});
