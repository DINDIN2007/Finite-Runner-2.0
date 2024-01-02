class CollisionBlock {
  constructor({ position, width, height, type }) {
    // Position on screen
    this.position = {
      x: position.x * scaleRatio,
      y: position.y * scaleRatio
    };

    // Position on overall map
    this.screenPosition = this.position;

    // Dimensions
    this.width = width * scaleRatio;
    this.height = height * scaleRatio;

    // Type of collision
    this.type = type;
  }

  // UPDATE COLLISION BLOCK
  update() {
    // Update screen position
    this.updatePosition();

    // Draw collision block
    this.draw();
  }

  // ACTUAL POSITION ON SCREEN
  updatePosition() {
    this.position = {
      x: this.screenPosition.x - currentLevel.anchor.x,
      y: this.screenPosition.y - currentLevel.anchor.y
    };
  }

  // FOR DEBUGGING, SHOW COLLISION BLOCKS
  draw() {
    // Coloring different type of collision
    switch (this.type) {
      case "Block":
        ctx.fillStyle = 'rgba(126, 48, 199, 0.5)';
        break;
      case "Lava":
        ctx.fillStyle = 'rgba(245, 158, 66, 0.5)';
        break;
      case "Ice":
        ctx.fillStyle = 'rgba(265, 0, 0, 0.5)';
        this.iceBridge();
        break;
      // Add more types
    }

    // Show collision blocks
    if (keys.showHitbox) {
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
  }

  iceBridge() {
    let bridge = document.getElementById("bridge");
    ctx.drawImage(bridge,
      0, 0,
      bridge.width, bridge.height,
      0, 2 * scaleRatio,
      canvas.width, canvas.height
    );
  }
}