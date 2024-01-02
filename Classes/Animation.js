// Child class in Player.js
// Some functions and variables are shared between Player and Sprite class
class Sprite {
  // INITIAL VALUES OF SPRITE ANIMATION WHEN CLASS IS CREATED
  constructor(startPosition, status) {
    // Overall position of Player
    this.position = {
      x: startPosition.x * scaleRatio,
      y: startPosition.y * scaleRatio
    };

    // Player state (none as of now)
    this.status = status;

    // Animation variables
    this.frame = 0;
    this.startFrame = 0;
    this.endFrame = 0;
    this.runOnce = false;
    this.animationFrame = 0;
    this.currentDelay = (new Date()).getTime();
    this.delay = 0.01 * 1000; // 1000 milisecond = 1 sec

    // Sprite dimensions
    this.spriteWidth = 50;
    this.spriteHeight = 50;
    this.offset = 1;

    // Sounds for animation
    this.currentSound = []; // Empty array means no sound

    // Current action to animate
    this.current = { action: "Idle", direction: "Right" }
  }

  // DRAW CURRENT FRAME
  draw(action, direction) {
    // Brake (no sprite animation for this action yet)
    if (action == "Run" && direction != this.current.direction) {
      action = "Brake";
    }

    // Check action and set which frames to animate from source
    if (action != this.current.action) {
      this.runOnce = false;
      switch (action) {
        // Idle animation
        case "Idle":
          this.startFrame = 0;
          this.endFrame = 3;
          this.currentSound = [];
          break;
        // Running animation
        case "Run":
          this.startFrame = 4;
          this.endFrame = 12;
          this.currentSound = sounds.run;
          break;
        // Jump animation based on player vertical velocity
        case "Land":
          this.startFrame = 12;
          this.endFrame = 12;
          this.currentSound = sounds.land;
          break;
        case "Hop":
          this.startFrame = 13;
          this.endFrame = 13;
          this.currentSound = sounds.jump;
          break;
        case "Float":
          this.startFrame = 14;
          this.endFrame = 14;
          this.currentSound = [];
          break;
        case "Drop":
          this.startFrame = 15;
          this.endFrame = 15;
          this.currentSound = [];
          break;
        case "Brake":
          // Add animation if enough time
          break;
      }

      // Change current action
      this.current = {
        action: action,
        direction: direction
      }

      // Reset animation frame
      this.frame = this.startFrame;
      this.currentDelay = 0;
    }

    // Speed boost animation (reduce intervals between frames)
    if (player.currentPowerUp == "speedBoost") this.delay = 0.05 * 1000;
    else this.delay = 0.075 * 1000;

    // Reset animation loop
    if (this.frame >= this.endFrame) this.frame = this.startFrame;
    let frame = this.frame * this.spriteWidth + this.offset;

    // Find image
    var playerSprite = document.getElementById(this.status + direction);

    // Add aura effect upon power up
    if (player.currentPowerUp != "") this.drawEffect("PowerUp");

    // Add fire effect when in lava
    if (player.touchedLava) this.drawEffect("Fire");

    // Draw animation frame
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(playerSprite,
      frame, 0,                                                      // Sposition
      this.spriteWidth, this.spriteHeight,                           // Sdimensions
      player.position.x - player.hitbox.offset.x,                    // Position X
      player.position.y - player.hitbox.offset.y,                    // Position Y
      player.hitbox.width + player.hitbox.offset.x * 2,              // Width
      player.hitbox.height + player.hitbox.offset.y                  // Length
    );

    // Draw sparkling effect when player is paralyzed (custom animation to be added...)
    if (player.touchedGhost) this.drawEffect("Sparkle");

    // Change frame based on real time delay
    let currentTime = (new Date()).getTime();

    if (this.currentDelay + this.delay < currentTime) {
      this.frame++;
      this.currentDelay = currentTime;
      playRandomFrom(this.currentSound, true);
    }

    // Seperate animation frame for special effects
    this.animationFrame = this.animationFrame % 24 + 1;
  };

  // DRAW SPECIAL EFFETS
  drawEffect(type) {

    // Find which frame and image source to take draw from
    let sprite, totalFrame;
    switch (type) {
      case "Fire":
        sprite = document.getElementById("Fire");
        totalFrame = 4;
        break;
      case "Sparkle":
        sprite = document.getElementById("Sparkle");
        totalFrame = 11;
        break;
      case "PowerUp":
        sprite = document.getElementById("PowerUp");
        totalFrame = 9;
      // Add more effects later
    }

    // Draw current frame for special effects
    let currentFrame = (this.animationFrame % totalFrame) * sprite.width / totalFrame;
    ctx.drawImage(sprite,
      currentFrame, 0,                                               // Sposition
      sprite.width / totalFrame, sprite.height,                      // Sdimensions
      player.position.x - player.hitbox.offset.x,                    // Position X
      player.position.y - player.hitbox.offset.y,                    // Position Y
      player.hitbox.width + player.hitbox.offset.x * 2,              // Width
      player.hitbox.height + player.hitbox.offset.y                  // Length
    );
  }
}