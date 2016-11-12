// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function () {
	princessReady = true;
};
princessImage.src = "images/princess.png";

// stone image
var stoneReady = false;
var stoneImage = new Image();
stoneImage.onload = function () {
	stoneReady = true;
};
stoneImage.src = "images/stone.png";

// monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var princess = {};
var stone = {};
var monster = {};
var princessesCaught = 0;
var deaths = 0;
var level = 1;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Throw element randomly in the terrain
var throwElement = function (element) {
	element.x = 64 + (Math.random() * (canvas.width - 128));
	element.y = 64 + (Math.random() * (canvas.height - 128));
};

var areTouching = function (element1, element2) {
	return (element1.x <= (element2.x + 16)
			&& element2.x <= (element1.x + 16)
			&& element1.y <= (element2.y + 16)
			&& element2.y <= (element1.y + 32));
};

// Reset the game when the player catches a princess
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the princess somewhere on the screen randomly
	throwElement(princess);
	
	// Throw the stone somwerhere on the screen randomly
	throwElement(stone);
	
	// Throw the monster somewhere on the screen randomly
	throwElement(monster);
	
	// Check if any stone or monster touchs the princess or the hero
	if (areTouching(hero,stone)
		|| areTouching(princess,stone)
		|| areTouching(hero,monster)
		|| areTouching(princess,monster)
	) {
		reset();
	}
};

// Update game objects
var update = function (modifier) {
	if (38 in keysDown) { // Player holding up
		// Calculate the new position
		var newPosition = {};
		newPosition.y = hero.y - hero.speed * modifier;
		newPosition.x = hero.x;
		// Check if newPosition is valid taking into account terrain limit and stones. If it is, then move
		if (newPosition.y >= 32 && !(areTouching(newPosition,stone)))
		{
			hero.y = newPosition.y;
		}
	}
	if (40 in keysDown) { // Player holding down
		// Calculate the new position
		var newPosition = {};
		newPosition.y = hero.y + hero.speed * modifier;
		newPosition.x = hero.x;
		// Check if newPosition is valid taking into account terrain limit and stones. If it is, then move
		if (newPosition.y <= canvas.height-64 && !(areTouching(newPosition,stone)))
		{
			hero.y = newPosition.y;
		}
	}
	if (37 in keysDown) { // Player holding left
		// Calculate the new position
		var newPosition = {};
		newPosition.y = hero.y;
		newPosition.x = hero.x - hero.speed * modifier;
		// Check if newPosition is valid taking into account terrain limit and stones. If it is, then move
		if (newPosition.x >= 32 && !(areTouching(newPosition,stone)))
		{
			hero.x = newPosition.x;
		}
	}
	if (39 in keysDown) { // Player holding right
		// Calculate the new position
		var newPosition = {};
		newPosition.y = hero.y;
		newPosition.x = hero.x + hero.speed * modifier;
		// Check if newPosition is valid taking into account terrain limit and stones. If it is, then move
		if (newPosition.x <= canvas.height-32 && !(areTouching(newPosition,stone)))
		{
			hero.x = newPosition.x;
		}
	}

	// Is the hero touching the princess? Rescue the next one
	if (areTouching(hero,princess))
	{
		++princessesCaught;
		if (princessesCaught == 10) {  // When you rescue 10 princesses in a level, you get to a higher one
			++level;
			princessesCaught = 0;
		}
		if (level == 10) {	// If you manage to get level 10, you win
			princessesCaught = 0;
			level = 1;
		}
		reset();
	}
	
	// Is the hero touching a monster? You die
	if (areTouching(hero,monster))
	{
		princessesCaught = 0; 
		level = 1;
		++deaths;
		reset();
	}

	storeData();
};

// Local Storage

var storeData = function() {
	localStorage.setItem("hero",JSON.stringify(hero));
	localStorage.setItem("princess",JSON.stringify(princess));
	localStorage.setItem("stone",JSON.stringify(stone));
	localStorage.setItem("monster",JSON.stringify(monster));
	localStorage.setItem("level",JSON.stringify(level));
	localStorage.setItem("princessesCaught",JSON.stringify(princessesCaught));
	localStorage.setItem("deaths",JSON.stringify(deaths));
};

var loadData = function() {
	var loaded = false;
	if (localStorage.getItem('hero')) {
		hero = JSON.parse(localStorage.getItem('hero'));
		princess = JSON.parse(localStorage.getItem('princess'));
		stone = JSON.parse(localStorage.getItem('stone'));
		monster = JSON.parse(localStorage.getItem('monster'));
		level = JSON.parse(localStorage.getItem('level'));
		princessesCaught = JSON.parse(localStorage.getItem('princessesCaught'));
		deaths = JSON.parse(localStorage.getItem('deaths'));
		loaded = true;
	}
	return loaded;
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}
	
	if (stoneReady) {
		ctx.drawImage(stoneImage, stone.x, stone.y);
	}
	
	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Level: " + level + "   Princesses caught: " + princessesCaught + "   Deaths: " + deaths, 32, 32);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
if (!loadData()) {
	reset();
}

var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible

/* Mejoras:
	-Para que la princesa no caiga en los árboles, se ha modificado la posición del spawn (ahora aparece 32px más hacia dentro de la imagen)
	-Para que el heroe no se salga del terreno, uso un if en update para que solo se actualice la posición si su posición actual es menor que
	 los límites del canvas. Como su posición es la del punto superior izquierdo de la imagen, en el caso del límite superior y el derecho
	 hay que poner más margen.
	-Para las piedras: se cargan las imagenes, se inicializa, se tira arbitrariamente en una posición distinta al heroe y a la princesa y se
	 hace que no se pueda tocar.
*/
