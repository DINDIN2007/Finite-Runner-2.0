// This class is used to create all other classes and is essentially the control center
class Level {
  // INITIAL VALUE FOR EACH LEVEL/WORLDS
  constructor(level) {
    // Level/World to build
    this.level = level;

    // Camera anchor
    this.anchor = {
      x: 0,
      y: 0
    };

    // Source image for chunks
    this.source = document.getElementById("map");

    // Variables of current chunks
    this.chunk = {
      width: 256,
      height: 256,
      loaded: []
    };

    this.progress = 0; // Count last chunk loaded

    // Pixel map to screen size
    scaleRatio = canvas.height / this.chunk.height;

    // Camera shaking animation
    this.levelShake = false;

    // Source image for background
    this.backgroundSource = [], this.backgroundProgress = 0;

    for (let i = 1; i <= 13; i++) {
      this.backgroundSource.push(document.getElementById("Bg" + i));
    }
    this.currentBackground = Math.floor(Math.random() * 13); // To randomise if necessary

    // Middle background progress
    this.midProgress = 0;
  };

  // INITIALIZE WHICH LEVEL/WORLD TO BUILD
  create() {
    switch (this.level) {
      case "Overworld":
        this.overworld();
        break;
      // Add more levels here
    }
  };

  // DRAW SELECTED LEVEL
  draw() {
    // Draw background
    this.drawBackground();

    // Draws chunk or player first depending on conditions
    if (!player.touchedLava) { this.loadChunks(); player.update(); }
    else { player.update(); this.loadChunks(); }

    // Update lavawall
    if(player.died)
      lavawall.ended = true;
    lavawall.update();

    // Turn on shaking animation when lavawall is near
    if (this.levelShake) canvas.classList.add('shakeCanvas');
    else canvas.classList.remove('shakeCanvas');
    if (keys.stopShaking) canvas.classList.remove('shakeCanvas');

    // Easter egg (look in Utilities.js 😉)
    let scoreBoard = document.getElementById("score");
    if (夜に駆ける) scoreBoard.innerHTML = lyrics;

    // Update the scoreboard
    else {
      let powerUp; // Current PowerUp
      if (player.currentPowerUp == "") powerUp = "NONE";
      else powerUp = player.currentPowerUp.toUpperCase();

      scoreBoard.innerHTML = // Show information
        "Powerup: " + powerUp + "<br>" +
        "Score: " + Math.floor(this.anchor.x / 10);
    }
  };

  // FIRST LEVEL DESIGN
  overworld() {
    // Chunk source image information
    map = document.getElementById("map");
    mapRatio = map.height / canvas.height;

    // Spawn player
    player = new Player({ x: 100, y: 100 }, "Normal");

    // Initialize array with all collision blocks/items
    collisionBlocks = [];
    items = [];
    enemies = [];

    // Load first 8 chunks
    for (let i = 0; i <= 8; i++) {
      this.chunk.loaded.push(new Chunk(this.chunk.width * i));
      this.progress++;
    }

    // Activate the lava wall
    lavawall = new Lavawall({ x: -500, y: 0 });
  };

  // Load chunks
  loadChunks() {
    // Reset collision blocks
    collisionBlocks = [];

    // Identify chunks and update them
    this.chunk.loaded.forEach((chunk) => {
      chunk.update();
    });

    // Turn on icewalk powerup
    if (player.currentPowerUp == "iceWalk") {
      collisionBlocks.push(new CollisionBlock({
        position: { x: currentLevel.anchor.x / scaleRatio, y: 187 },
        width: 10000,
        height: 10000,
        type: "Ice"
      }));
    }

    // Update all collision blocks
    collisionBlocks.forEach((collision) => {
      collision.update();
    });

    // Draw all collision blocks
    this.chunk.loaded.forEach((chunk) => {
      chunk.draw();
    });

    // Draw and updates items/objects
    items.forEach((item) => {
      item.update();
    });

    // Draw enemies
    enemies.forEach((enemy) => {
      enemy.update();
    });
  }

  // DRAW BACKGROUND OF GAME
  drawBackground() {
    // Background
    let img = this.backgroundSource[this.currentBackground];
    ctx.drawImage(img,
      this.anchor.x / 100 - img.width * this.backgroundProgress, 0,
      img.height, img.height, 0, 0, canvas.width, canvas.height
    );

    let nextBackgroundIndex = (this.currentBackground + 1) % this.backgroundSource.length;
    img = this.backgroundSource[nextBackgroundIndex];

    // Draw next background
    ctx.drawImage(img,
      this.anchor.x / 100 - img.width * (this.backgroundProgress + 1), 0,
      img.height, img.height, 0, 0, canvas.width, canvas.height
    );

    if ((this.anchor.x / 100) - img.width * (this.backgroundProgress + 1) > img.width / 2) {
      this.backgroundProgress++;
      this.currentBackground = nextBackgroundIndex;
    }

    // Transition tower
    let transition = document.getElementById("Transition");
    let startPos = this.anchor.x / 100 - img.width * (this.backgroundProgress + 1);

    ctx.drawImage(transition,
      this.anchor.x / 100 - transition.width * (this.backgroundProgress + 0.5), 0,
      transition.height, transition.height, 0, 0, canvas.width, canvas.height
    );

    // Draw middle ground
    let middle = document.getElementById("MiddleGround");

    ctx.drawImage(middle,
      this.anchor.x / 50 - middle.width * this.midProgress, 0,
      middle.height, middle.height, 0, 0, canvas.width, canvas.height
    );

    ctx.drawImage(middle,
      this.anchor.x / 50 - middle.width * (this.midProgress + 1) + 1, 0,
      middle.height, middle.height, 0, 0, canvas.width, canvas.height
    );

    ctx.drawImage(middle,
      this.anchor.x / 50 - middle.width * (this.midProgress + 2) + 1, 0,
      middle.height, middle.height, 0, 0, canvas.width, canvas.height
    ); // Bigger screen can make missing background be more evident

    if ((this.anchor.x / 50) - middle.width * (this.midProgress + 1) > middle.width / 2) {
      this.midProgress++;
    }
  }
}

// This class is used to create each chunk that generates its own collision blocks, items, enemies and background
class Chunk {
  // INITIAL VALUE FOR EACH CHUNK
  constructor(startingPosition) {
    // Current Position on screen
    this.position = {
      x: startingPosition * scaleRatio,
      y: 0
    };

    // Where to spawn the chunk
    this.screenPosition = this.position;

    // Source chunk dimensions
    this.width = 256;
    this.height = 256;

    // Source image for all chunks
    this.chunkSource = document.getElementById("map");

    // Choose random chunk template
    this.template = Math.floor(Math.random() * (this.chunkSource.width / 256 - 1) + 1);

    // Random percentage to spawn item/enemies
    this.spawn = {
      items: Math.random() * 100 <= 25,
      ghost: Math.random() * 100 <= 30,
      wolf: Math.random() * 100 <= 50
    }
    
    // Delay time before deleting a chunk
    // No delay results in chunks deleting in front of users
    this.delay = 5;

    // Collision blocks inside each chunk
    this.collisionBlocks = [];

    // First chunk template
    if (this.position.x == 0) this.template = 0;

    // List of collision blocks/items per template chunk
    switch (this.template + 1) {
      case 1: this.template1(); break;
      case 2: this.template2(); break;
      case 3: this.template3(); break;
      case 4: this.template4(); break;
      case 5: this.template5(); break;
      case 6: this.template6(); break;
      case 7: this.template7(); break;
      case 8: this.template8(); break;
      case 9: this.template9(); break;
      case 10: this.template10(); break;
      case 11: this.template11(); break;
      case 12: this.template12(); break;
      case 13: this.template13(); break;
      // Add more chunk for more immersion
      default: this.template1();
    }

    // Spawn enemy
    if (currentLevel.progress <= 5) return; // Don't spawn at beginning
    
    // Spawing values
    let start = this.screenPosition.x / scaleRatio;
    let maxGhost = 5;
    let numGhost = Math.floor(Math.random() * maxGhost);

    for (let i = 0; i < numGhost; i++) {
      if (!this.spawn.ghost && this.position.x != 0) {
        this.spawn.ghost = Math.random() * 100 <= 30;
        continue;
      }
      // Add enemy
      enemies.push(new Enemy({
        position: {
          x: start + Math.floor(Math.random() * 256), y: Math.floor(Math.random() * 256)
        }, type: "Ghost", limit: 20
      }));
      // Reset spawn rate
      this.spawn.ghost = Math.random() * 100 <=  30 - 5 * i;
    }

    // Rare ghost sound
    if (this.spawn.ghost && Math.random() * 100 <= 10) sounds.ghost[0].play();

    // Spawn wolf
    if (!this.spawn.wolf) return;
    enemies.push(new Enemy({
      position: {x: start, y: 157}, 
      type: "Wolf", limit: 20
    }));
  }

  // UPDATE CHUNK
  update() {
    // Updates and checks position relative to level anchor
    this.updatePosition();

    // Update collision blocks
    this.collisionBlocks.forEach((collision) => {
      collisionBlocks.push(collision);
    });
  }

  // UPDATE CHUNK POSITION
  updatePosition() {
    // Changes chunk position based on screen anchor progress
    this.position = {
      x: this.screenPosition.x - currentLevel.anchor.x,
      y: this.screenPosition.y - currentLevel.anchor.y
    }

    // Remove and create new chunk when anchor it is out of screen
    if (currentLevel.anchor.x > this.screenPosition.x + this.width * scaleRatio * this.delay) {
      currentLevel.chunk.loaded.push(new Chunk(this.width * currentLevel.progress));
      currentLevel.progress++;
      currentLevel.chunk.loaded.shift();
    }
  }

  // DRAW CHUNK PLATFORMS
  draw() {
    ctx.drawImage(this.chunkSource,
      this.width * this.template, 0, // sx, sy
      this.width, this.height, // swidth, sheight
      this.position.x, this.position.y,  // x, y
      this.width * scaleRatio, canvas.height // width, height
    );
  }

  // TEMPLATE ARRANGEMENT OF COLLISION BLOCKS, ITEMS AND ENEMIES
  template1() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 256,
        height: 69,
        type: "Block"
      })
    );
  }

  template2() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 87,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 176, y: 187 },
        width: 256 - 176,
        height: 69,
        type: "Block"
      }),
      // PLATFORMS
      new CollisionBlock({
        position: { x: start + 114, y: 183 },
        width: 32,
        height: 16,
        type: "Block"
      }),
    );
  }

  template3() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 256,
        height: 69,
        type: "Block"
      }),
      // PLATFORMS
      new CollisionBlock({
        position: { x: start + 74, y: 132 },
        width: 96,
        height: 16,
        type: "Block"
      }),
    );
  }

  template4() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 62,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 114, y: 187 },
        width: 256 - 114,
        height: 69,
        type: "Block"
      }),
      // PLATFORMS
      new CollisionBlock({
        position: { x: start + 142, y: 144 },
        width: 16,
        height: 16,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 141, y: 85 },
        width: 16,
        height: 16,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 187, y: 114 },
        width: 16,
        height: 16,
        type: "Block"
      }),
    );

    // Chest
    if (!this.spawn.items) return;
    items.push(new Object({
      position: { x: start + 141, y: 69 },
      type: "Chest"
    }));
  }

  template5() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 58,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 188, y: 187 },
        width: 256 - 188,
        height: 69,
        type: "Block"
      }),
      // PLATFORMS
      new CollisionBlock({
        position: { x: start + 89, y: 184 },
        width: 16,
        height: 16,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 134, y: 184 },
        width: 16,
        height: 16,
        type: "Block"
      })
    );
  }

  template6() {
    let start = this.screenPosition.x / scaleRatio;
    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 72,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 164, y: 187 },
        width: 256 - 164,
        height: 69,
        type: "Block"
      }),
      // PLATFORM
      new CollisionBlock({
        position: { x: start + 103, y: 152 },
        width: 32,
        height: 16,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 78, y: 190 },
        width: 80,
        height: 69,
        type: "Lava"
      })
    );
  }

  template7() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 256,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 31, y: 137 },
        width: 159,
        height: 16,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 79, y: 89 },
        width: 63,
        height: 16,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 222, y: 119 },
        width: 16,
        height: 16,
        type: "Block"
      })
    );

    if (!this.spawn.items) return;
    items.push(new Object({
      position: { x: start + 111, y: 72 },
      type: "Chest",
      limit: 0
    }));
  }

  template8() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 70,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 158, y: 187 },
        width: 256 - 158,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 15, y: 89 },
        width: 175,
        height: 16,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 195, y: 144 },
        width: 16,
        height: 16,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 222, y: 119 },
        width: 16,
        height: 16,
        type: "Block"
      }),
    );

    if (!this.spawn.items) return;
    items.push(new Object({
      position: { x: start + 63, y: 72 },
      type: "Chest",
      limit: 0
    }));
  }

  template9() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 41,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 110, y: 187 },
        width: 33,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 214, y: 187 },
        width: 256 - 214,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 43, y: 190 },
        width: 64,
        height: 69,
        type: "Lava"
      }),
      new CollisionBlock({
        position: { x: start + 147, y: 190 },
        width: 63,
        height: 69,
        type: "Lava"
      })
    );
  }

  template10() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 256,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 31, y: 97 },
        width: 127,
        height: 16,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 170, y: 155 },
        width: 16,
        height: 32,
        type: "Block"
      })
    );

    if (!this.spawn.items) return;
    items.push(new Object({
      position: { x: start + 111, y: 80 },
      type: "Chest",
      limit: 0
    }));
  }

  template11() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 40,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 210, y: 187 },
        width: 256 - 210,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 111, y: 152 },
        width: 16,
        height: 16,
        type: "Block"
      })
    );
  }

  template12() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 92,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 162, y: 187 },
        width: 256 - 162,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 119, y: 139 },
        width: 16,
        height: 30,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 119, y: 75 },
        width: 16,
        height: 30,
        type: "Block"
      })
    );
  }

  template13() {
    let start = this.screenPosition.x / scaleRatio;

    this.collisionBlocks.push(
      // GROUND
      new CollisionBlock({
        position: { x: start, y: 187 },
        width: 134,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 208, y: 187 },
        width: 256 - 208,
        height: 69,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 119, y: 120 },
        width: 16,
        height: 64,
        type: "Block"
      }),
      new CollisionBlock({
        position: { x: start + 192, y: 87 },
        width: 16,
        height: 16,
        type: "Block"
      })
    );

    if (!this.spawn.items) return;
    items.push(new Object({
      position: { x: start + 192, y: 70 },
      type: "Chest",
      limit: 0
    }));
  }
}