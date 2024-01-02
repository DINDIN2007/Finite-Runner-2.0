// Parent class in Animation.js
// Some functions and variables are shared between Player and Sprite class
class Player extends Sprite {
  // INITIAL VALUES OF PLAYER WHEN CLASS IS CREATED
  constructor(startPosition, status) {
    // Overall position of player and his state
    super(startPosition, status);

    // Gravity (Different for each screen size)
    this.gravity = 1 * (1080 / window.screen.height);

    // Friction
    this.friction = 0.5;

    // Running Speed (To fix)
    this.speed = 2;
    this.faster = 50;
    this.maxSpeed = 10;

    // Jumping height
    this.leap = 23;
    this.highJump = this.leap * 4 / 3;

    // Touching ground boolean
    this.collided = false;

    // Movement Velocity
    this.velocity = {
      x: 0,
      y: 0
    };

    // Current action to animate
    this.action = "";
    this.direction = "Right";

    // Current powerups and its timer
    this.currentPowerUp = "";
    this.powerUpTime = 1000 * 5; // 1000 milisecond = 1 second
    this.powerUpStart = (new Date()).getTime();

    // Death scenarios
    this.touchedLava = false;
    this.died = false;

    // Ghost effects
    this.touchedGhost = false;
    this.ghostEffect = {
      start: (new Date()).getTime(),
      time: 1000 * 2
    }

    // Wolf effect
    this.touchedWolf = false;
  };

  // CALLS NECESSARY FUNCTIONS FOR EACH FRAME
  update() {
    // Reset Values
    let currentTime = (new Date()).getTime();
    this.action = "";

    // Updates the players hitbox
    this.updateHitbox();

    // Check if any ghost is touching player
    if (this.ghostEffect.start + this.ghostEffect.time < currentTime) {
      this.touchedGhost = false;
    }
    this.checkEnemies();

    // Checks key inputs
    this.handleKey();

    // Updates the players hitbox
    this.updateHitbox();

    // Applies gravity and checks for collision side to side
    this.HorizontalCollision();
    this.Gravity();

    // Idle animation
    this.draw(this.action, this.direction);
    this.collided = false;

    // Stop updating position when died
    if (this.died) return;

    // Updates the players hitbox
    this.updateHitbox();

    // Show hitbox
    if (keys.showHitbox) {
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.75)';
      ctx.beginPath();
      ctx.rect(
        this.hitbox.position.x,
        this.hitbox.position.y,
        this.hitbox.width,
        this.hitbox.height
      );
      ctx.stroke();
      ctx.closePath();
    }

    // Check collisionBlock below the player
    this.VerticalCollision();

    // Interact with Items
    this.Interaction();

    // Check/Remove Powerup Timer
    if (currentTime > this.powerUpStart + this.powerUpTime) this.currentPowerUp = "";

    // Debug mode
    if (keys.showHitbox) {
      this.maxSpeed = 100000;
      return;
    }
    
    // Check death
    if (this.checkDeath()) this.died = true;
  };

  // APPLY GRAVITY
  Gravity() {
    // Constant gravity upon touching lava
    if (this.touchedLava) this.velocity.y = this.gravity;
    // Linear increments for normal gravity
    else this.velocity.y += this.gravity;

    // Update position with new velocity
    this.position.y += this.velocity.y;
  };

  // PLAYERS'S HITBOX
  updateHitbox() {
    this.hitbox = {
      // Position of hitbox
      position: {
        x: this.position.x + 0,
        y: this.position.y + 0
      },
      // Starting position of sprite
      offset: {
        x: 5 * scaleRatio,
        y: 3 * scaleRatio
      },
      // Hitbox dimension
      width: 17 * scaleRatio,
      height: 24 * scaleRatio,
    }
  };

  // KEYS AND CONTROLS FOR PLAYER MOVEMENT
  handleKey() {
    // Turn off movement upon touching lava
    if (this.touchedLava || this.died || this.touchedGhost) {
      this.action = "Idle";
      return;
    }

    // Vertical Mouvement (Jumping)
    if (keys.up && this.velocity.y == 0) {
      if (this.currentPowerUp == "jumpBoost") this.velocity.y = -this.highJump;
      else this.velocity.y = -this.leap;
      playRandomFrom(sounds.jump, false);
    }
    keys.up = false;

    // Jump animation based on current vertical velocity
    if (this.velocity.y != 0) {
      // Stages of jumping animation
      if (Math.round(Math.abs(this.velocity.y) / 10) * 10 == 0) this.action = "Float";
      else if (this.velocity.y % this.leap > 20) this.action = "Land";
      else if (this.velocity.y < 0) this.action = "Hop";
      else if (this.velocity.y > 0) this.action = "Drop";
    }
    else if (!this.collided) this.action = "Float";

    // Wolf throwing player
    if (this.touchedWolf) {
      this.position.x -= this.velocity.x;
      if (this.collided) this.touchedWolf = false;
      return;
    }
    
    // Horizontal Mouvement
    if (keys.left) {
      // Left border of the screen
      if (this.position.x <= 0) this.position.x = 0;
      // Change to x velocity speed
      if (this.currentPowerUp == "speedBoost") this.velocity.x -= this.speed * this.faster;
      this.velocity.x -= this.speed;
      // Change to run left animation
      if (this.action == "" && this.collided) {
        this.action = "Run";
        this.direction = "Left";
      }
    }
    else if (keys.right) {
      // Add to x velocity speed
      if (this.currentPowerUp == "speedBoost") this.velocity.x += this.speed * this.faster;
      this.velocity.x += this.speed;
      // Change to run right animation
      if (this.action == "" && this.collided) {
        this.action = "Run";
        this.direction = "Right";
      }
    }
    else this.velocity.x = 0;

    // Find what direction player is facing
    let direction = (this.velocity.x > 0) ? 1 : -1;

    // Max acceleration (Isn't really noticeable and should be fixed)
    if (this.currentPowerUp == "speedBoost" && Math.abs(this.velocity.x) > this.maxSpeed * this.faster) {
      this.velocity.x = this.maxSpeed * this.faster * direction;
    }
    else if (Math.abs(this.velocity.x) > this.maxSpeed) this.velocity.x = this.maxSpeed * direction;

    // Update player's horizontal position
    if (this.position.x >= canvas.width / 2 && this.velocity.x > 0) {
      // Player is halfway on the screen, so move camera
      this.position.x = canvas.width / 2;
      currentLevel.anchor.x += this.velocity.x;
    }
    else if (this.position.x < 0) this.position.x = 0; // Left screen border limitation
    else this.position.x += this.velocity.x; // Move player instead of camera

    // Idle Animation
    if (this.action == "" && this.velocity.y == 0) this.action = "Idle";
  };

  // CHECK HORIZONTAL COLLISION
  HorizontalCollision() {
    // Pass through wall powerup activated
    if (this.currentPowerUp == "passThroughWalls" && this.collided) return;
    // Deactivate collision upon touching lava
    if (this.touchedLava) return;

    // Checking every platforms that has collision
    for (var collisionBlock of collisionBlocks) {
      // Check all 4 sides of the collisionBlock
      let rightSide = this.hitbox.position.x < collisionBlock.position.x + collisionBlock.width;
      let leftSide = this.hitbox.position.x + this.hitbox.width > collisionBlock.position.x;
      let topSide = this.hitbox.position.y + this.hitbox.height > collisionBlock.position.y;
      let bottomSide = this.hitbox.position.y < collisionBlock.position.y + collisionBlock.height;

      if (leftSide && topSide && bottomSide && rightSide) {
        // Left side of wall
        if (this.velocity.x > 0 && !this.touchedWolf) {
          this.position.x = collisionBlock.position.x - this.hitbox.width;
        }
        // Right side of wall
        if (this.velocity.x < 0 || this.touchedWolf) {
          this.position.x = collisionBlock.position.x + collisionBlock.width;
        }

        // Break for loop
        this.collided = true;
        return;
      }
    }
  }

  // CHECK VERTICAL COLLISION
  VerticalCollision() {
    // Deactivate collision upon touching lava
    if (this.touchedLava) return;

    // Checking every platforms that has collision
    for (var collisionBlock of collisionBlocks) {
      // Check all 4 sides of the collisionBlock
      let rightSide = this.hitbox.position.x < collisionBlock.position.x + collisionBlock.width;
      let leftSide = this.hitbox.position.x + this.hitbox.width > collisionBlock.position.x;
      let topSide = this.hitbox.position.y + this.hitbox.height >= collisionBlock.position.y;
      let bottomSide = this.hitbox.position.y <= collisionBlock.position.y + collisionBlock.height;

      if (leftSide && rightSide && topSide && bottomSide) {
        // Detect collision with lava
        if (collisionBlock.type == "Lava" && player.currentPowerUp != "iceWalk") {
          this.touchedLava = true;
          this.gravity = 0.4;
          playRandomFrom(sounds.lavaDeath, false);
        }
        // Landing on collision block
        else if (this.velocity.y > 0) {
          this.position.y = collisionBlock.position.y - this.hitbox.height;
        }
        // Hitting collision block from bottom
        else if (this.velocity.y < 0) {
          this.position.y = collisionBlock.position.y + collisionBlock.height;
        }

        this.velocity.y = 0;
        this.collided = true;
        return;
      }
    }
  };

  // CHECK ITEMS TO INTERACT WITH
  Interaction() {
    // Checking every iems in the world
    for (var item of items) {
      // Check all 4 sides of the item
      let rightSide = this.hitbox.position.x < item.position.x + item.width * scaleRatio;
      let leftSide = this.hitbox.position.x + this.hitbox.width > item.position.x;
      let topSide = this.hitbox.position.y + this.hitbox.height >= item.position.y;
      let bottomSide = this.hitbox.position.y <= item.position.y + item.height * scaleRatio;

      if (leftSide && rightSide && topSide && bottomSide && !item.used) {
        switch (item.type) {
          // TOUCHED CHEST
          case "Chest":
            item.state = "Second";
            items.push(new Object({
              position: {
                x: item.screenPosition.x / scaleRatio,
                y: (item.screenPosition.y - 30) / scaleRatio
              }, type: "Lid"
            }));
            // Chest drop
            items.push(new Object({
              position: {
                x: item.screenPosition.x / scaleRatio,
                y: (item.screenPosition.y - 30) / scaleRatio
              }, type: "PowerUp"
            }));
            break;
          case "PowerUp":
            // Delete powerup item
            items.splice(items.indexOf(item), 1);
            playRandomFrom(sounds.powerUp);

            // Apply powerup
            this.currentPowerUp = item.powerUp;
            console.log(item.powerUp);
            this.powerUpStart = (new Date()).getTime();
            break;
          // Add more interactions
        }
      }
    }
  }
  
  // CHECK IF PLAYER TOUCHED ANY ENEMIES
  checkEnemies() {
  // If the player has the pass through walls, they can also pass through ghosts
  if (this.currentPowerUp == "passThroughWalls") return;

  // Checks every ghost spawned
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    // Check all 4 sides of each enemy
    let rightSide = this.hitbox.position.x < enemy.position.x + enemy.width;
    let leftSide = this.hitbox.position.x + this.hitbox.width > enemy.position.x;
    let topSide = this.hitbox.position.y + this.hitbox.height >= enemy.position.y;
    let bottomSide = this.hitbox.position.y <= enemy.position.y + enemy.height;

    if (leftSide && rightSide && topSide && bottomSide) {
      switch (enemy.type) {
        case "Ghost":
          // Play zap sound
          var zap = new Audio('Music and SFX/Ghost Zap/zap.mp3');
          zap.play();
          // Paralyse effect
          this.ghostEffect.start = new Date().getTime();
          this.touchedGhost = true
          // Remove the ghost from the enemies array
          enemies.splice(i, 1);
          break;
        case "Wolf":
          // Play zap sound
          var bark = new Audio('Music and SFX/WolfAttack.wav');
          bark.play();
          // Bounce player backward
          this.velocity = {
            x: 10,
            y: (-this.leap / 4) * 3
          }
          this.touchedWolf = true;
      }

      return;
    }
  }
}


  // CHECK IF PLAYER HAS DIED TO ANY CONDITIONS
  checkDeath() {
    if (this.position.y + this.hitbox.height > canvas.height || this.touchedLava) {
      this.died = true;
      playRandomFrom(sounds.death, false);
      this.action = "Idle";
      setTimeout(restart, 1000);
    }
  }
}


// Easter eggs for anime watchers
var lyrics = "[Intro] Just like I'm about to sink, just like I'm about to melt Only the two of us at night in the vast sky [Verse] It was only a simple goodbye But it was all I needed to understand The sinking sun the rising night sky Overlaps with your figure behind the fence Ever since the first day we met You stole my heart Like you were wrapped IN fragile air You had a lonely gaze [Pre_Chorus] In the world always ringing WITH tick_tocks again and again Touching the heartless words and loud voices Even IF tears are about to spill If it were the two of us together I'm sure mundane happiness could be found [Chorus] In the troubling days FOR the never_smiling you I give my utmost love IN hopes FOR the dazzling tomorrow In the never ending night before we fall Come and take my hand Even the days that you hid inside wanting to forget It'll melt WITH the warmth of my embraces No need to be afraid until dawn comes someday Let's be together";