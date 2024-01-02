// This class is used to create the lavawall that chases the player
class Lavawall {
  ended = false;
  // INITIAL VALUE FOR THE LAVAWALL
  constructor(startPosition) {
    // Animation parameters
    this.frame = 0;
    this.endFrame = 6;
    this.spriteWidth = 640;
    this.spriteHeight = 480;
    this.currentDelay = 0;
    this.delay = 2;

    // Current position
    this.position = {
      x: (startPosition.x - this.spriteWidth) * scaleRatio,
      y: startPosition.y * scaleRatio
    };

    // Lavawall movement parameters
    this.speed = 7;
    this.increments = 1;
    this.progress = 1;
    this.speedIncrement = 1000;
    this.maxSpeed = 25;

    // Image source
    this.lavaSprite = document.getElementById("LavaWall");
    this.ended = false;
  }

  // UPDATE LAVAWALL
  update() {
    // Update screen position
    this.updatePosition();

    // Draw collision block
    this.draw();
  }

  // MOVES WALL FOWARD AND UPDATES ITS POSITION
  updatePosition() {
    if (this.ended) return;
    // Stops moving after consuming whole screen (Makes screen black)
    if (this.position.x >= currentLevel.anchor.x) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      playRandomFrom(sounds.death, false);
      Retry();
      this.ended = true;
      return;
    }

    // Move wall foward at constant speed
    this.position.x += this.speed;

    // Catch up to player when more than 2000 away from screen position
    if (this.position.x + this.spriteWidth * scaleRatio < currentLevel.anchor.x - 1500 * scaleRatio) {
      this.position.x = currentLevel.anchor.x - 1500;
    }

    // Active shake animation
    if (this.position.x + this.spriteWidth * scaleRatio > currentLevel.anchor.x) currentLevel.levelShake = true;
    else currentLevel.levelShake = false;

    // Speed up lavawall depending on score
    if (Math.floor(currentLevel.anchor.x / 10) > this.progress * this.scoreIncrease) {
      this.progress++; this.speed += this.increments;
      if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
    }
  }

  // DRAW LAVAWALL
  draw() {
    // Reset animation loop
    if (this.frame >= this.endFrame) {
      this.frame = 0;
    }
    let frame = this.frame * this.spriteWidth;

    // Draw lavawall on canvas
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.lavaSprite,
      frame - 1, 0,
      this.spriteWidth, this.spriteHeight,
      this.position.x - currentLevel.anchor.x, this.position.y,
      this.spriteWidth * scaleRatio, this.spriteHeight * scaleRatio
    );

    // Change frame based on delay
    if (this.currentDelay < this.delay) this.currentDelay++;
    // Next animation frame
    else if (this.frame < this.endFrame) {
      this.frame++;
      this.currentDelay = 0;
    }
  }
}