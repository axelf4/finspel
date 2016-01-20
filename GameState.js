define(["three", "fowl", "GPUParticleSystem", "game", "components", "MainMenuState", "GameScoreState", "EffectComposer", "circleCollision"],
		function(THREE, fowl, GPUParticleSystem, game, components, MainMenuState, GameScoreState, EffectComposer, circleCollision) {
			var em; // TODO remove
			var createPlayer = function() {
				var options = {
					position: new THREE.Vector3(),
					positionRandomness: 5,
					velocity: new THREE.Vector3(),
					velocityRandomness: 90,
					color: 0xaa88ff,
					colorRandomness: .2,
					turbulence: .8,
					lifetime: 2,
					size: 10,
					sizeRandomness: 0
				};

				var player = em.createEntity();
				em.addComponent(player, new Position(game.virtualWidth / 2, game.virtualHeight / 2));
				em.addComponent(player, new Velocity());
				em.addComponent(player, new Emitter(options, 5));
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
				em.addComponent(powerup, new Position(left + Math.random() * right, bottom + Math.random() * top));
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

			var canBeKilled = function(entity) {
				return !em.hasComponent(entity, Mothership);
			};

			var player;

			var updatePlayer = function(dt) {
				var position = em.getComponent(player, Position);
				var velocity = em.getComponent(player, Velocity);
				velocity.x = 0;
				velocity.y = 0;
				var speed = 0.35;
				if (game.keys[65] || game.keys[37]) velocity.x -= speed;
				if (game.keys[83] || game.keys[40]) velocity.y -= speed;
				if (game.keys[68] || game.keys[39]) velocity.x += speed;
				if (game.keys[87] || game.keys[38]) velocity.y += speed;
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
				var speed = 0.165;
				direction = direction * Math.PI / 180;
				em.addComponent(enemy, new Velocity(Math.cos(direction) * speed, Math.sin(direction) * speed));
				em.addComponent(enemy, new Emitter(options, 0.1));
				em.addComponent(enemy, new Enemy());
				em.addComponent(enemy, new Lifetime(8000));
				em.addComponent(enemy, new CircleShape(25));
				return enemy;
			};

			var scale;
			var left = 0, right = 800, bottom = 0, top = 600;

			var enemyTimer = 0, enemySpawnRate;
			var updateEnemies = function(dt) {
				enemyTimer += dt;
				enemySpawnRate = Math.max(400, enemySpawnRate - 0.015 * dt);
				// TODO switch to loop
				if (enemyTimer > enemySpawnRate) {
					if (enemyTimer - enemySpawnRate > enemySpawnRate) console.log("Enemy spawn overflow");
					enemyTimer = 0; // enemyTimer -= enemySpawnRate;
					var x, y, pad = 50;
					pad = 0;
					direction = Math.random() * 360;
					// var right = game.virtualWidth / scale, top = game.virtualHeight / scale;
					if (direction < 135 && direction >= 45) {
						x = Math.random() * right;
						y = bottom - pad;
					} else if (direction < 225 && direction >= 135) {
						x = right + pad;
						y = Math.random() * top;
					} else if (direction < 315 && direction >=225) {
						x = Math.random() * right;
						y = top + pad;
					} else {
						x = left - pad;
						y = Math.random() * top;
					}
					spawnEnemy(x, y, direction, dt);
				}
			};
			var spawnMothership = function() {
				if (game.sounds.inception) game.playAudio(game.sounds.inception);
				window.setTimeout(function() { if (game.sounds.inception) game.playAudio(game.sounds.inception); }, 4000);
				var direction = Math.random() * 2 * Math.PI;
				var distance = 3200;
				var x = Math.cos(direction) * distance, y = Math.sin(direction) * distance;
				direction -= Math.PI;
				var options = {
					position: new THREE.Vector3(),
					positionRandomness: 100,
					velocity: new THREE.Vector3(),
					velocityRandomness: 1000,
					color: 0x1BE215,
					colorRandomness: .5,
					turbulence: 30,
					lifetime: 15,
					size: 1000,
					sizeRandomness: 30
				};
				var enemy = em.createEntity();
				em.addComponent(enemy, new Position(x, y));
				var speed = 0.04;
				em.addComponent(enemy, new Velocity(Math.cos(direction) * speed, Math.sin(direction) * speed));
				em.addComponent(enemy, new Emitter(options, 0.0001));
				em.addComponent(enemy, new Enemy());
				em.addComponent(enemy, new Lifetime(70000));
				em.addComponent(enemy, new CircleShape(300));
				em.addComponent(enemy, new Mothership(direction));
			};
			var updateMothership = function(dt) {
				var mothershipExists = false;
				em.each(function(entity) {
					mothershipExists = true;
					var mothership = em.getComponent(entity, Mothership);
					var position = em.getComponent(entity, Position);

					mothership.childTimer += dt;
					var childInterval = 2000;
					if (mothership.childTimer > childInterval) {
						mothership.childTimer -= childInterval;
						var direction = Math.random() * 360;
						var enemy = spawnEnemy(position.x, position.y, direction);
						em.addComponent(enemy, new Homing(direction * Math.PI / 180));
					}
				}, Mothership);
				return mothershipExists;
			};
			var updateHoming = function(dt) {
				var factor = powerupType.SLOWMO.remaining <= 0 ? 1 : 1 / 3;
				em.each(function(entity) {
					var position = em.getComponent(entity, Position);
					var velocity = em.getComponent(entity, Velocity);
					var homing = em.getComponent(entity, Homing);
					var lifetime = em.getComponent(entity, Lifetime);
					var phase = lifetime.life / lifetime.total;

					var speed, turnRate;
					if (phase > 0.5) {
						speed = 0.11;
						turnRate = 1;
					} else {
						speed = 1.3;
						turnRate = 0.0003;
					}
					turnRate *= factor;
					var playerPos = em.getComponent(player, Position);
					var angle = Math.atan2(playerPos.y - position.y, playerPos.x - position.x);
					if (angle !== homing.direction) {
						var delta = angle - homing.direction;
						// Keep it in range from -180 to 180 to make the most efficient turns.
						if (delta > Math.PI) delta -= Math.PI * 2;
						if (delta < -Math.PI) delta += Math.PI * 2;
						if (delta > 0) homing.direction += turnRate * dt;
						else homing.direction -= turnRate * dt;
						if (Math.abs(delta) < turnRate * dt) homing.direction = angle;
					}
					velocity.x = Math.cos(homing.direction) * speed;
					velocity.y = Math.sin(homing.direction) * speed;
				}, Position, Velocity, Lifetime, Homing);
			};

			var updateVelocities = function(dt) {
				var factor = powerupType.SLOWMO.remaining <= 0 ? 1 : 1 / 3;
				em.each(function(entity) {
					var position = em.getComponent(entity, Position);
					var velocity = em.getComponent(entity, Velocity);
					position.x += velocity.x * dt * factor;
					position.y += velocity.y * dt * factor;
					if (em.hasComponent(entity, StayInside)) {
						if (position.x < left) position.x = left;
						if (position.x > right) position.x = right;
						if (position.y < bottom) position.y = bottom;
						if (position.y > top) position.y = top;
					}
				}, Position, Velocity);
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
							if (powerupType.INVINCIBILITY.remaining > 0) {
								if (canBeKilled(entity)) em.removeEntity(entity);
							} else {
								console.log("collision mate");
								dead = true;
							}
						} else if (em.hasComponent(entity, PowerupComponent)) {
							// if (Math.random() < 0.02) game.openLink("http://lmgtfy.com/?q=you+got+a+powerup");
							var type = em.getComponent(entity, PowerupComponent).type;
							type.remaining += type.duration;
							if (game.sounds[type.sound]) game.playAudio(game.sounds[type.sound]);
							em.removeEntity(entity);
							if (type === powerupType.NUKE) em.each(function(entity) {
								if (canBeKilled(entity)) em.removeEntity(entity);
								enemyTimer -= 200;
							}, Enemy);
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
					maxParticles: 50000,
					containerCount: 3
				});
				game.scene.add(this.particleSystem);
				player = createPlayer();
				this.drawScore(this.oldScore = this.score = 0);
				enemyTimer = 0;
				enemySpawnRate = 1000;
				powerupTimer = 0;
				this.scaleTimer = 0;
				this.hadMothership = false;
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

				var mothershipExists = updateMothership(dt);
				if (!mothershipExists && !this.hadMothership && this.score > 25) {
					this.hadMothership = true;
				   	spawnMothership();
				}
				this.scaleTimer = Math.max(0, Math.min(1, this.scaleTimer + (mothershipExists ? 1 : -1) * 0.00005 * dt));
				scale = 1 + 5 * Math.easeInCubic(this.scaleTimer);
				this.particleSystem.scale.x = 1 / scale;
				this.particleSystem.scale.y = 1 / scale;
				this.particleSystem.position.x = game.virtualWidth / 2 * -(1 / scale - 1);
				this.particleSystem.position.y = game.virtualHeight / 2 * -(1 / scale - 1);

				left = -game.virtualWidth * (scale - 1) / 2;
				bottom = -game.virtualHeight * (scale - 1) / 2;
				right = left + game.virtualWidth * scale;
				top = bottom + game.virtualHeight * scale;

				updatePowerups(dt);
				updatePlayer(dt);
				if (!mothershipExists) updateEnemies(dt);
				updateHoming(dt);
				if (detectCollisions()) {
					game.playAudio(game.sounds.dieSound);
					game.stateManager.setState(new GameScoreState(GameState, this.score));
				}
				updateVelocities(dt);
				em.each(updatePosition, Position, THREEObject);
				em.each(function(entity) {
					var lifetime = em.getComponent(entity, Lifetime);
					lifetime.life -= dt / scale;
					if (lifetime.life <= 0) em.removeEntity(entity);
				}, Lifetime);

				em.each(function(entity) {
					var position = em.getComponent(entity, Position);
					var emitter = em.getComponent(entity, Emitter);
					if (!emitter.enabled) return;
					emitter.options.position.x = position.x;
					emitter.options.position.y = position.y;
					var count = Math.min(2000, emitter.spawnRate * dt);
					for (var x = 0; x < count; ++x) self.particleSystem.spawnParticle(emitter.options);
				}, Position, Emitter);
				this.particleSystem.update(tick, game.getScale() / scale);
			};
			return GameState;
		});
