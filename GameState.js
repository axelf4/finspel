define(["three", "fowl", "GPUParticleSystem", "game", "components", "constants", "MainMenuState", "EffectComposer", "circleCollision"],
		function(THREE, fowl, GPUParticleSystem, game, components, constants, MainMenuState, EffectComposer, circleCollision) {
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
				em.addComponent(player, new Velocity());
				em.addComponent(player, new Emitter(options, 20));
				em.addComponent(player, new StayInside());
				em.addComponent(player, new CircleShape(15));
				return player;
			};

			var powerupType = {
				SLOWMO: {
					duration: 8000,
					remaining: 0,
					sound: "slowmo"
				},
				INVINCIBILITY: {
					duration: 6000,
					remaining: 0,
					sound: "invincible"
				},
				NUKE: {
					duration: 2000,
					remaining: 0,
					sound: "emp"
				}
			};

			var createPowerup = function() {
				var options = {
					position: new THREE.Vector3(),
					positionRandomness: 20,
					velocity: new THREE.Vector3(),
					velocityRandomness: 500,
					color: 0x818F82,
					colorRandomness: .3,
					turbulence: 0.5,
					lifetime: 0.5,
					size: 35,
					sizeRandomness: 30
				};

				var powerup = em.createEntity();
				em.addComponent(powerup, new Position(Math.random() * constants.virtualWidth, Math.random() * constants.virtualHeight));
				em.addComponent(powerup, new Emitter(options, 0.2));
				em.addComponent(powerup, new Lifetime(4000));
				em.addComponent(powerup, new CircleShape(15));
				// Random type of powerup
				var keys = Object.keys(powerupType);
				var type = powerupType[keys[keys.length * Math.random() << 0]];
				em.addComponent(powerup, new PowerupComponent(type));
			};

			var powerupTimer = 0;
			var updatePowerups = function(dt) {
				var dirty = false;
				for (var key in powerupType) {
					if (!powerupType.hasOwnProperty(key)) continue;
					var old = powerupType[key].remaining;
					if ((powerupType[key].remaining -= dt) < 0) powerupType[key].remaining = 0;
					if (old > 0 && powerupType[key].remaining === 0 ||
							old === powerupType[key].duration) dirty = true;
				}
				if (dirty) game.buildEffects();

				powerupTimer += dt;
				var powerupSpawnRate = 15000;
				if (powerupTimer > powerupSpawnRate) {
					powerupTimer = 0;
					createPowerup();
				}
			};

			game.addEffectBuilder(function(composer) {
				if (powerupType.SLOWMO.remaining > 0) {
					dotScreenPass = new THREE.DotScreenPass();
					composer.addPass(dotScreenPass);
				}
				game.glitchPass.goWild = powerupType.INVINCIBILITY.remaining > 0;
				em.getComponent(player, Emitter).enabled = powerupType.NUKE.remaining <= 0;
				if (powerupType.INVINCIBILITY.remaining > 0) {}
			});

			var MOVEMENT_SPEED = 0.4;
			var player;

			var updatePlayer = function(dt) {
				var position = em.getComponent(player, Position);
				var velocity = em.getComponent(player, Velocity);
				velocity.x = 0;
				velocity.y = 0;
				if ((game.keys[65] || game.keys[37]) && position.x > 0) velocity.x -= MOVEMENT_SPEED;
				if ((game.keys[83] || game.keys[40]) && position.y > 0) velocity.y -= MOVEMENT_SPEED;
				if ((game.keys[68] || game.keys[39]) && position.x < constants.virtualWidth) velocity.x += MOVEMENT_SPEED;
				if ((game.keys[87] || game.keys[38]) && position.y < constants.virtualHeight) velocity.y += MOVEMENT_SPEED;
			};
			var spawnEnemy = function(x, y, direction, dt) {
				var options = {
					position: new THREE.Vector3(),
					positionRandomness: 50,
					velocity: new THREE.Vector3(),
					velocityRandomness: 0,
					color: 0x1BE215,
					colorRandomness: .5,
					turbulence: 3,
					lifetime: 3,
					size: 70,
					sizeRandomness: 30
				};
				var enemy = em.createEntity();
				em.addComponent(enemy, new Position(x, y));
				em.addComponent(enemy, new LastPosition());
				var speed = 0.165;
				direction = direction * Math.PI / 180;
				em.addComponent(enemy, new Velocity(Math.cos(direction) * speed, Math.sin(direction) * speed));
				em.addComponent(enemy, new Emitter(options, 0.1));
				em.addComponent(enemy, new Enemy());
				em.addComponent(enemy, new Lifetime(8000));
				em.addComponent(enemy, new CircleShape(25));
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
				var factor = powerupType.SLOWMO.remaining <= 0 ? 1 : 1 / 3;
				em.each(function(entity) {
					var position = em.getComponent(entity, Position);
					var lastPosition = em.getComponent(entity, LastPosition);
					var velocity = em.getComponent(entity, Velocity);
					lastPosition.x = position.x;
					lastPosition.y = position.y;
					position.x += velocity.x * dt * factor;
					position.y += velocity.y * dt * factor;
					if (em.hasComponent(entity, StayInside)) {
						if (position.x < 0) position.x = 0;
						if (position.x > constants.virtualWidth) position.x = constants.virtualWidth;
						if (position.y < 0) position.y = 0;
						if (position.y > constants.virtualHeight) position.y = constants.virtualHeight;
					}
				}, Position, LastPosition, Velocity);
			};
			var updatePosition = function(entity) {
					var position = em.getComponent(entity, Position),
					object = em.getComponent(entity, THREEObject);
					object.object.position.set(position.x, position.y, 0);
			};
			var detectCollisions = function() {
				var dead = false;
				em.each(function(entity) {
					var p1 = em.getComponent(player, Position);
					var p2 = em.getComponent(entity, Position);

					var pos1 = new THREE.Vector2(p1.x, p1.y);
					var pos2 = new THREE.Vector2(p2.x, p2.y);
					var radius1 = em.getComponent(player, CircleShape).radius;
					var radius2 = em.getComponent(entity, CircleShape).radius;
					var playerVelocity = em.getComponent(player, Velocity);
					var movevec = new THREE.Vector2(playerVelocity.x, playerVelocity.y);
					if (em.hasComponent(entity, Velocity)) {
						var entityVelocity = em.getComponent(entity, Velocity);
						movevec.sub(new THREE.Vector2(entityVelocity.x, entityVelocity.y));
					}
					if (circleCollision(pos1, pos2, radius1, radius2, movevec)) {
						if (em.hasComponent(entity, Enemy)) {
							if (powerupType.INVINCIBILITY.remaining > 0) return;
							console.log("collision mate");
							dead = true;
						} else if (em.hasComponent(entity, PowerupComponent)) {
							// if (Math.random() < 0.02) game.openLink("http://lmgtfy.com/?q=you+got+a+powerup");
							var type = em.getComponent(entity, PowerupComponent).type;
							type.remaining += type.duration;
							if (game.sounds[type.sound]) game.playAudio(game.sounds[type.sound]);
							em.removeEntity(entity);
							if (type === powerupType.NUKE) em.each(function(entity) { em.removeEntity(entity); }, Enemy);
						}
					}
				}, Position, CircleShape);
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
				em.clear();
				this.particleSystem = new THREE.GPUParticleSystem({
					maxParticles: 300000,
					containerCount: 3
				});
				game.scene.add(this.particleSystem);
				player = createPlayer();
				this.drawScore(this.oldScore = this.score = 0);
			};
			GameState.prototype.onLeave = function() {
				for (var key in powerupType) powerupType[key].remaining = 0;
				game.buildEffects();
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
				updatePowerups(dt);
				updatePlayer(dt);
				updateEnemies(dt);
				if (detectCollisions()) {
					game.playAudio(game.sounds.dieSound);
					game.stateManager.setScene(new MainMenuState(GameState, this.score));
				}
				updateVelocities(dt);
				em.each(updatePosition, Position, THREEObject);
				em.each(function(entity) {
					var lifetime = em.getComponent(entity, Lifetime);
					lifetime.life -= dt;
					if (lifetime.life <= 0) em.removeEntity(entity);
				}, Lifetime);
				em.each(function(entity) {
					var position = em.getComponent(entity, Position),
					emitter = em.getComponent(entity, Emitter);
				if (!emitter.enabled) return;
				emitter.options.position.x = position.x;
				emitter.options.position.y = position.y;
				var count = Math.min(2000, emitter.spawnRate * dt);
				for (var x = 0; x < count; ++x) self.particleSystem.spawnParticle(emitter.options);
				}, Position, Emitter);
				this.particleSystem.update(tick);
			};
			return GameState;
		});
