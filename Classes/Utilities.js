// THIS JS FILE CONTAINS NONE RELATED FUNCTIONS AND PARAMETERS USED IN THE OTHER JS FILES

// CHANGE GAME BACK WHEN SCREEN IS RESIZED
addEventListener("resize", function() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  init();
});

// INPUTS
var keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  click: false,
  showHitbox: false,
  stopShaking: false,
  pause: false
};

var doubleJump = 0; // Not used in the game

// PRESS KEYS
document.addEventListener("keydown", function(event) {
  switch (event.key) {
    case "ArrowLeft": // Left arrow
    case "a": // A key
      keys.left = true;
      break;
    case "ArrowUp": // Up arrow
    case "w": // W key 
      if (!player.collided) break;
      keys.up = true;
      break;
    case "ArrowRight": // Right arrow
    case "d": // D key
      keys.right = true;
      break;
    case "s": // Down Arrow (Not really used for anything)
      keys.down = true;
      break;
    case "h": // H key
      keys.showHitbox = (keys.showHitbox) ? false : true;
      break;
    case "p": // P key
      keys.pause = (keys.pause) ? false : true;
      console.log("Paused");
      break;
    case "z": // Z key
      keys.stopShaking = (keys.stopShaking) ? false : true;
      break;
  }

  // Easter egg
  mysteriousCode(event.key);
});

// PRESS MOBILE BUTTONS
function gamepadL() { keys.left = true; }
function gamepadR() { keys.right = true; }
function gamepadU() { if (player.collided) keys.up = true; }

// RELEASE MOBILE BUTTONS
function releaseL() { keys.left = false; }
function releaseR() { keys.right = false; }
function releaseU() { keys.up = false; }


// RELEASE KEYS
document.addEventListener("keyup", function(event) {
  switch (event.key) {
    case "ArrowLeft": // Left arrow
    case "a": // A key
      keys.left = false;
      break;
    case "ArrowUp": // Up arrow
    case "w": // W key
      keys.up = false;
      break;
    case "ArrowRight": // Right arrow
    case "d": // D key
      keys.right = false;
      break;
    case "s": // Down Arrow
      keys.down = false;
      break;
  }
});

// MOUSE DOWN
document.addEventListener("mousedown", function() { keys.click = true; });

// MOUSE POSITION
var mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

// UPDATE MOUSE POSITION
document.addEventListener("mousemove", function(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

// LOAD SOUNDS
var sounds = {
  run: [],
  jump: [new Audio("Music and SFX/Jump/Leap.wav")],
  land: [new Audio("Music and SFX/Jump/Land.wav")],
  chest: [new Audio("Music and SFX/Chest/Chest.mp3")],
  powerUp: [new Audio("Music and SFX/smb_powerup_appears.wav")],
  death: [],
  lavaDeath: [new Audio("Music and SFX/Death/LavaDeath.wav")],
  ghost: [new Audio("Music and SFX/Ooh.mp3")],
  playing: new Audio() // Current sounds playing at all times
}

// Add runnning sounds
for (let i = 1; i < 10; i++) sounds.run.push(new Audio("Music and SFX/Run/Run" + i + ".wav"));
// Death Sound
for (let i = 1; i < 6; i++) sounds.death.push(new Audio("Music and SFX/Death/Ded" + i + ".mp3"));

// PLAY SOUND FROM GIVEN TRACK
function playRandomFrom(playlist, series) {
  // No sound files in array
  if (playlist.length == 0) return;
  // Plays on top of other sounds
  if (!series) {
    playlist[Math.floor(Math.random() * (playlist.length - 1))].play();
    return;
  }
  // A sound is being played
  if (sounds.playing.duration > 0 && !sounds.playing.paused) return;
  // Play sound
  sounds.playing = playlist[Math.floor(Math.random() * (playlist.length - 1))];
  sounds.playing.play();
}

// Repeating music for background ambience
var savedSong = 0;
var currentSong = new Audio();

function playMusic() {
  currentSong.src = "Music and SFX/Game-Music/GM0.mp3";
  currentSong.volume = 0.2;
}

currentSong.addEventListener("canplaythrough", (event) => {
  /* the audio is now playable; play it if permissions allow */
  currentSong.play();
});

currentSong.addEventListener("ended", function(event) {

  // Choose random song that is not the same as the current one
  let chooseSong;
  do {
    chooseSong = Math.floor(Math.random() * 13);
  } while (chooseSong == savedSong); // Pick until new song

  // Load new song
  currentSong.src = "Music and SFX/Game-Music/GM" + chooseSong + ".mp3";
  savedSong = chooseSong;
});

// Distance formula
function findDistance(obj1, obj2) {
  return Math.sqrt((obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2);
}

// Retry game condition
function Retry() {
  // Create the popup container
  var popupContainer = document.createElement("div");
  popupContainer.style.position = "fixed";
  popupContainer.style.top = "0";
  popupContainer.style.left = "0";
  popupContainer.style.width = "100%";
  popupContainer.style.height = "100%";
  popupContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  popupContainer.style.display = "flex";
  popupContainer.style.justifyContent = "center";
  popupContainer.style.alignItems = "center";
  popupContainer.style.zIndex = "9999";

  // Create the popup box
  var popupBox = document.createElement("div");
  popupBox.style.backgroundColor = "#fff";
  popupBox.style.padding = "20px";
  popupBox.style.borderRadius = "5px";
  popupBox.style.textAlign = "center";

  // Create the retry button
  var retryButton = document.createElement("button");
  retryButton.innerText = "Retry";
  retryButton.style.width = "5em";
  retryButton.style.height = "2em";
  retryButton.style.color = "#fff";
  retryButton.style.textDecoration = "none";
  retryButton.style.backgroundColor = "#dbc114";
  retryButton.style.fontFamily = "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif";
  retryButton.style.fontWeight = "bold";
  retryButton.style.fontSize = "30px";
  retryButton.style.borderRadius = "10px";
  retryButton.style.webkitBorderRadius = "10px";
  retryButton.style.mozBorderRadius = "10px";
  retryButton.style.boxShadow = "0px 10px 0px #b69b16, 0px 10px 30px #b6b016";
  retryButton.style.webkitBoxShadow = "0px 10px 0px #b6b016, 0px 10px 30px #b6b016";
  retryButton.style.mozBoxShadow = "0px 10px 0px #b69b16, 0px 10px 30px #b69b16";
  retryButton.style.margin = "20px auto";
  retryButton.style.textAlign = "center";
  retryButton.style.transition = "all .4s ease";
  retryButton.style.webkitTransition = "all .4s ease";
  retryButton.style.mozTransition = "all .4s ease";
  retryButton.style.msTransition = "all .4s ease";
  retryButton.style.oTransition = "all .4s ease";

  // Add event listener to the retry button
  retryButton.addEventListener("click", function() {
    location.reload(); // Reload the page
  });

  // Add the active state styling
  retryButton.addEventListener("mousedown", function() {
    retryButton.style.webkitBoxShadow = "0px 3px 0px #9a8709, 0px 9px 25px #9a8709";
    retryButton.style.mozBoxShadow = "0px 3px 0px #9a8709, 0px 9px 25px #9a8709";
    retryButton.style.boxShadow = "0px 3px 0px #9a8709, 0px 9px 25px #9a8709";
  });
  retryButton.addEventListener("mouseup", function() {
    retryButton.style.webkitBoxShadow = "0px 10px 0px #b6b016, 0px 10px 30px #b6b016";
    retryButton.style.mozBoxShadow = "0px 10px 0px #b69b16, 0px 10px 30px #b69b16";
    retryButton.style.boxShadow = "0px 10px 0px #b69b16, 0px 10px 30px #b69b16";
  });

  // Display highscore
  let score = Math.floor(currentLevel.anchor.x / 10);
  if (savedScore < score) {
    savedScore = score;
    setCookie("highscore", savedScore, 365);
  }
  
  var highscore = document.createElement("p");
  highscore.innerHTML = "Current Score : <br>" + score
    + "<br><br>" + "Highscore : <br>" + savedScore;

  // Append the retry button and highscore to the popup box
  popupBox.appendChild(retryButton);
  popupBox.appendChild(highscore);

  // Append the popup box to the popup container
  popupContainer.appendChild(popupBox);

  // Append the popup container to the body
  document.body.appendChild(popupContainer);
}

// Call the function to create the retry popup
//Retry();

// Easter egg for anime watchers
var code = "", 夜に駆ける = false;
var song = new Audio("Music and SFX/Chest/Unopen.mp3");
const konamiCode = "UUDDLRLRba";

function mysteriousCode(key) {
  let char = key.replace("Arrow", "");
  start = true;

  if (code.length < 10) code += char[0];
  else code = code.substring(1) + char[0];

  if (code == konamiCode) {
    console.log("You really tried that...");
    // Stop current song
    currentSong.pause();
    currentSong.currentTime = 0;
    // Deliver
    currentSong = song;
    currentSong.play();
    // Change score
    夜に駆ける = true;
  }
}

// Change a Cookie
function setCookie(cName, cValue, expDays) {
  let date = new Date();
  date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
}

// Get value of a cookie (From W3 school)
function getCookie(cName) {
  const name = cName + "=";
  const cDecoded = decodeURIComponent(document.cookie); //to be careful
  const cArr = cDecoded.split('; ');
  let res;
  cArr.forEach(val => {
      if (val.indexOf(name) === 0) res = val.substring(name.length);
  });
  return res;
}