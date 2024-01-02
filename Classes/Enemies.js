// This class is used to create every enemies
class Enemy {
  constructor({ position, type, limit }) {
    // Current position of enemy
    this.position = {
      x: position.x * scaleRatio,
      y: position.y * scaleRatio
    };

    // Initial position of enemy
    this.screenPosition = this.position;

    // Figure out moving mecanics for each enemies
    this.speed = {
      x: 3.5,
      y: 1
    };
    this.increments = {
      x: 0,
      y: 0
    };
    this.moved = 0;
    this.range = 100 * scaleRatio;

    // Source image for each enemy
    this.type = type;

    // Range of movement for gravity based enemies
    this.limit = limit * scaleRatio;

    // Source image
    this.source = document.getElementById("NormalGhost");

    // Enemy animation
    this.animationFrame = 0;
    this.currentDelay = (new Date()).getTime();

    // Dropping velocity
    this.velocity = 0;
    this.gravity = player.gravity

    switch (this.type) {
      case "Ghost":
        this.source = document.getElementById("NormalGhost");
        this.totalFrame = 2;
        this.width = 25 * scaleRatio;
        this.height = 25 * scaleRatio;
        this.delay = 0.5 * 1000; // 1000 milisecond = 1 sec
        break;
      case "Wolf":
        this.source = document.getElementById("NormalWolf");
        this.totalFrame = 4;
        this.width = 51 * scaleRatio;
        this.height = 30 * scaleRatio;
        this.delay = 0.05 * 1000; // 1000 milisecond = 1 sec
        break;
    }
  }

  // UPDATE ENEMY
  update() {
    // Update Enemy Movement
    this.updateMovement();

    // Update Enemy Position
    this.updatePosition();

    // Draw enemy
    this.draw();
  }

  // MOUVEMENT PER ENEMY TYPE
  updateMovement() {
    // Find type of enemy mouvement
    switch (this.type) {
      case "Ghost":
        this.increments = {
          x: -this.speed.x * this.moved,
          y: -this.speed.y
            * Math.sin((this.position.x + currentLevel.anchor.x) / 100)
            * ((this.range + this.screenPosition.y * scaleRatio) % this.limit)
        };
        break;
      case "Wolf":
        // Linear movement
        this.increments = {
          x : -this.speed.x * this.moved,
          y : this.increments.y
        };
        // Wolf fall out of map
        if (!this.checkPlatform()) {
          this.velocity += this.gravity;
          this.increments.y += this.velocity;
        }
        // Keep wolf at ground level
        else {
          this.velocity = 0;
          this.increments.y = 0;
        }
        break;
      // Add more types of enemies
    }
    // Saved movement progress 
    // (how far has enemy traveled from initial position)
    this.moved++;
  }

  // ACTUAL POSITION ON SCREEN
  updatePosition() {
    this.position = {
      x: this.screenPosition.x + this.increments.x - currentLevel.anchor.x,
      y: this.screenPosition.y + this.increments.y - currentLevel.anchor.y
    };

    // Delete enemy when it leaves screen
    if (this.position.x + this.width * scaleRatio < 0 || this.position.y > canvas.height) {
      enemies.splice(enemies.indexOf(this), 1);
    }
  }

  // DRAW ENEMY
  draw() {
    // Current frame
    let frame = (this.animationFrame % this.totalFrame);

    // Draw enemy
    ctx.drawImage(this.source,
      (this.source.width / this.totalFrame) * frame, 0, this.source.width / this.totalFrame, this.source.height,
      this.position.x, this.position.y,
      this.width, this.height
    );

    // Show hitbox
    if (keys.showHitbox) {
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.75)';
      ctx.beginPath();
      ctx.rect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
      ctx.stroke();
      ctx.closePath();
    }

    // Change frame based on real time delay
    let currentTime = (new Date()).getTime();

    if (this.currentDelay + this.delay < currentTime) {
      this.frame++;
      this.currentDelay = currentTime;
      this.animationFrame = this.animationFrame % 24 + 1;
      if (this.type == "Wolf") playRandomFrom(sounds.run, true)
    }
  }

  // FOR GROUND TYPE ENEMIES, CHECK IF THERE IS A PLATFORM BELOW
  checkPlatform() {
    for (var collisionBlock of collisionBlocks) {
      // Check if it is a grass platform
      if (collisionBlock.position.y != 187 * scaleRatio) continue; 
      // Check if grass platform is within
      let rightSide = this.position.x < collisionBlock.position.x + collisionBlock.width;
      let leftSide = this.position.x + (this.width - 10 * scaleRatio) > collisionBlock.position.x;
      // Platform under enemy detected
      if (rightSide && leftSide) {
        this.increments.y = 0;
        return true;
      }
    }

    // No platform under enemy, therefore enemy starts falling
    return false;
  }
}