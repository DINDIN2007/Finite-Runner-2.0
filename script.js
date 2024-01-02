// SETTING UP CANVAS
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// FITTING CANVAS TO WHOLE PAGE
canvas.width = innerWidth;
canvas.height = innerHeight;

// INITIALIZING THE VALUES
var currentLevel = new Level("Overworld");
var collisionBlocks, player, items, lavawall, enemies;
// Map background
var map = document.getElementById("map");
var mapRatio = map.width / canvas.height;
var scaleRatio = canvas.height / map.height;
// Start game boolean
var started = false, paused = false;
// Saved cookies
var savedScore = 0;

// SETTING UP COOKIES
if (!(getCookie("highscore") > -1)) setCookie("highscore", 0, 365);
else savedScore = getCookie("highscore");

// START/PAUSE MENU
var menu = document.getElementById("opening");
var title = document.getElementById("menuTitle");
var button1 = document.getElementById("button1");

// INITIALIZATION OF A LEVEL
function init() {
  currentLevel = new Level("Overworld");
  currentLevel.create();
}

// MOBILE CONTROLS
const isMobile = {
  Android: function() { return navigator.userAgent.match(/Android/i); },
  BlackBerry: function() { return navigator.userAgent.match(/BlackBerry/i); },
  iOS: function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
  Opera: function() { return navigator.userAgent.match(/Opera Mini/i); },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function() {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};

// Check if user is on mobile
if (!isMobile.any()) document.getElementById("controls").style.display = "none";

// SET CONSTANT FPS
const FPS = 60;

// FRAME BY FRAME DRAWING ANIMATION
function animate() {
  // Change refresh rate to a constant
  setTimeout(() => {
    window.requestAnimationFrame(animate);
  }, 1000 / FPS);

  // Pause menu
  if (keys.pause) {
    menu.style.display = "inline";
    pauseMusic()
    return;
  }
  else menu.style.display = "none";

  // Erase everything on the screen
  ctx.fillStyle = "#5c94fc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the whole level again
  currentLevel.draw();
}

// START GAME UPON PRESSING START RUN
function startGame() {
  // Start Game
  init();
  animate();

  // Hide menu
  menu.style.opacity = 0;
  // Play music
  playMusic();
  
  // Change layout
  button1.innerHTML = "Continue";
 // title.innerHTML = "Pause";
}

function restart() {
  Retry();
}