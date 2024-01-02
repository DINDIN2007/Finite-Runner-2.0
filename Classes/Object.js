// This class is used to create every objects
class Object {
  // INITIAL VALUES OF OBJECT WHEN CLASS IS CREATED
  constructor({ position, type }) {
    // Position on screen
    this.position = {
      x: position.x * scaleRatio,
      y: position.y * scaleRatio
    };

    // Position on overall map
    this.screenPosition = this.position;

    // Dimensions
    this.width = 16;
    this.height = 16;

    // Type of collision
    this.type = type;
    this.spriteWidth = 16;
    this.spriteHeight = 16;
    this.used = false;

    // Gravity ?
    this.gravity = 0;
    this.launchMax = 0;
    this.pulseUp = -25;
    this.willCollide = false;
    this.collided = false;

    // Powerup list for chest
    let powerList = [
      "passThroughWalls",
      "speedBoost",
      "jumpBoost",
      "iceWalk"
    ];
    let randomPower = Math.floor(Math.random() * powerList.length);
    this.powerUp = powerList[randomPower];

    // Figure out what type of object
    switch (this.type) {
      case "Chest":
        this.state = "First";
        this.spriteStart = 0;
        break;
      case "Lid":
        this.state = "First";
        this.spriteStart = 2;
        this.used = true;
        this.gravity = 1;
        this.launchMax = 20;
        this.pulseUp = -15;
        break;
      case "PowerUp":
        this.state = "First";
        this.spriteStart = 3 + randomPower;
        this.gravity = 1;
        this.willCollide = true;
        break;
      // Add more items
    }

    // Item drop velocity
    this.velocity = {
      x: Math.random() * this.launchMax - this.launchMax / 2,
      y: this.pulseUp
    };
  }

  // RUNS ALL NECESSARY FUNCTIONS FOR OBJECT
  update() {
    // Update screen position
    this.updatePosition();

    // Draw collision block
    this.draw();

    // Apply gravity for specific items
    if (this.gravity != 0 && !this.collided) {
      // Apply gravity on object
      this.Gravity();

      // For items that use collision
      if (this.willCollide) this.VerticalCollision();
    }

    // Delete item when it leaves screen
    if (this.position.x + this.width * scaleRatio < 0) {
      items.splice(items.indexOf(this), 1);
    }
  }

  // UPDATE OBJECT POSITION BASED ON MAP PROGRESSION
  updatePosition() {
    this.position = {
      x: this.screenPosition.x - currentLevel.anchor.x,
      y: this.screenPosition.y - currentLevel.anchor.y
    }
  }

  // DRAW OBJECT
  draw() {
    // Object animation variables
    var items = document.getElementById("items");
    let frame = this.spriteStart * this.spriteWidth;

    // Object and player interaction
    if (this.state == "Second" && !this.used) {
      this.spriteStart++;
      this.used = true;
      playRandomFrom(sounds.chest, false);
    }

    // Draw image
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(items,
      0, frame,
      this.spriteWidth, this.spriteHeight - 0.1,
      this.position.x, this.position.y + scaleRatio,
      this.spriteWidth * scaleRatio, this.spriteHeight * scaleRatio
    );

    // Item hitbox
    if (keys.showHitbox) {
      ctx.strokeStyle = 'rgba(123.5, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.rect(
        this.position.x,
        this.position.y,
        this.width * scaleRatio,
        this.height * scaleRatio
      );
      ctx.stroke();
      ctx.closePath();
    }
  }

  // GRAVITY FOR OBJECT
  Gravity() {
    // Increments vertical velocity from gravity
    this.velocity.y += this.gravity;
    this.screenPosition.y += this.velocity.y

    // X movement from initial drop
    this.screenPosition.x += this.velocity.x;

    // Delete item after leaving screen
    if (this.position.y > innerHeight) {
      items.splice(items.indexOf(this), 1);
    }
  }

  // COLLISION FROM ITEM DROPS
  VerticalCollision() {
    // Checking every platforms that has collision
    for (var collisionBlock of collisionBlocks) {
      // Check all 4 sides of the collisionBlock
      let rightSide = this.position.x <= collisionBlock.position.x + collisionBlock.width;
      let leftSide = this.position.x + this.width * scaleRatio >= collisionBlock.position.x;
      let topSide = this.position.y + this.height * scaleRatio >= collisionBlock.position.y;
      let bottomSide = this.position.y <= collisionBlock.position.y + collisionBlock.height;

      if (leftSide && rightSide && topSide && bottomSide) {
        // Falling down
        if (this.velocity.y > 0) {
          this.screenPosition.y = collisionBlock.position.y - this.height * scaleRatio;
        }

        this.velocity.y = 0;
        this.collided = true;
        return;
      }
    }
  };
}