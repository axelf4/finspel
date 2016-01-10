define(["three", "fowl", "GPUParticleSystem", "game", "components", "constants", "MainMenuState"],
		function(THREE, fowl, GPUParticleSystem, game, components, constants, MainMenuState) {
			var em; // TODO remove
			var createPlayer = function() {
				var options = {
					position: new THREE.Vector3(),
					positionRandomness: 1,
					velocity: new THREE.Vector3(10),
					velocityRandomness: 50,
					color: 0xaa88ff,
					colorRandomness: .2,
					turbulence: .5,
					lifetime: 0.8,
					size: 10,
					sizeRandomness: 2
				};

				var player = em.createEntity();
				em.addComponent(player, new Position(constants.virtualWidth / 2, constants.virtualHeight / 2));
				em.addComponent(player, new LastPosition());
				em.addComponent(player, new Emitter(options, 40));
				return player;
			};

			var MOVEMENT_SPEED = 0.4;
			var player;

			var updatePlayer = function(dt) {
				var position = em.getComponent(player, Position);
				if ((game.keys[65] || game.keys[37]) && position.x > 0) position.x -= MOVEMENT_SPEED * dt;
				if ((game.keys[83] || game.keys[40]) && position.y > 0) position.y -= MOVEMENT_SPEED * dt;
				if ((game.keys[68] || game.keys[39]) && position.x < constants.virtualWidth) position.x += MOVEMENT_SPEED * dt;
				if ((game.keys[87] || game.keys[38]) && position.y < constants.virtualHeight) position.y += MOVEMENT_SPEED * dt;
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
					lifetime: 3,
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
				// TODO switch to loop
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

			var GameState = function() {
				em = this.em2 = new fowl.EntityManager();
			};
			GameState.prototype.drawScore = function(score) {
				game.textRenderer.drawEnv(function(ctx) {
					ctx.fillStyle = game.textRenderer.getGradient();
					ctx.font = "24px Verdana";
					ctx.fillText("Score: " + Math.floor(score), 0, 580);
				});
			};
			GameState.prototype.onEnter = function() {
				this.particleSystem = new THREE.GPUParticleSystem({
					maxParticles: 100000
				});
				game.scene.add(this.particleSystem);
				player = createPlayer();
				this.drawScore(this.oldScore = this.score = 0);
			};
			GameState.prototype.onLeave = function() {
				em.clear();
				game.scene.remove(this.particleSystem);
			};
			GameState.prototype.draw = function() {
			};
			GameState.prototype.update = function(dt, tick) {
				var self = this;
				this.score += dt / 2000;
				if (this.score > this.oldScore + 1) {
					this.drawScore(this.score);
					this.oldScore = this.score;
				}
				updatePlayer(dt);
				updateEnemies(dt);
				updateVelocities(dt);
				em.each(updatePosition, Position, THREEObject);
				if (detectCollisions()) game.stateManager.setScene(new MainMenuState(GameState, this.score));
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
				for (var x = 0; x < count; ++x) self.particleSystem.spawnParticle(emitter.options);
				}, Position, Emitter);
				this.particleSystem.update(tick);
			};
			return GameState;
		});
