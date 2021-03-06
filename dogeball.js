// Constants	
P1_UP = 87		// 'w'
P1_DOWN = 83	//	's'
P1_LEFT = 65	// 'a'
P1_RIGHT = 68	// 'd'

P2_UP = 38		// UP ARROW
P2_DOWN = 40	// DOWN ARROW
P2_LEFT = 37	// LEFT ARROW
P2_RIGHT = 39	// RIGHT ARROW

function Game() {
	var canvas = document.getElementById("game");
	this.width = canvas.width;
	this.height = canvas.height;
	this.context = canvas.getContext("2d");
	this.context.fillStyle = "white";
	this.keys = new KeyListener();

	this.p1 = new Paddle(5, 0);
	this.p1.y = this.height/2 - this.p1.height/2;
	this.display1 = new Display(this.width/4, 25);
	this.p2 = new Paddle(this.width - 15, 0);
	this.p2.y = this.height/2 - this.p2.height/2;
	this.display2 = new Display(this.width*3/4, 25);

	this.ball = new Ball();
	this.ball.x = this.width/2;
	this.ball.y = this.height/2;
	this.ball.vy = Math.floor(Math.random() * 12 - 6);
	this.ball.vx = 7 - Math.abs(this.ball.vy);
}

Game.prototype.draw = function()
{
	this.context.clearRect(0, 0, this.width, this.height);
	this.context.fillRect(this.width/2, 0, 10, this.height);

	this.ball.draw(this.context);

	this.p1.draw(this.context);
	this.p2.draw(this.context);

	this.display1.draw(this.context);
	this.display2.draw(this.context);
};

Game.prototype.update = function()
{
	if (this.paused)
		return;

	this.ball.update();
	this.display1.value = this.p1.score;
	this.display2.value = this.p2.score;

	// To which direction is the paddle is moving
	if (this.keys.isPressed(P1_DOWN)) {	// DOWN
		this.p1.y = Math.min(this.height - this.p1.height, this.p1.y + 5);
	} else if (this.keys.isPressed(P1_UP)) {	// UP
		this.p1.y = Math.max(0, this.p1.y - 5);
	} else if (this.keys.isPressed(P1_LEFT)) {	// LEFT
		this.p1.x = Math.max(0, this.p1.x - 5);
	} else if (this.keys.isPressed(P1_RIGHT) && this.p1.x < this.width/2 - 20) {	// RIGHT
		this.p1.x = Math.min(this.width - this.p1.width, this.p1.x + 5);		
	}

	if (this.keys.isPressed(P2_DOWN)) {	// DOWN
		this.p2.y = Math.min(this.height - this.p2.height, this.p2.y + 5);
	} else if (this.keys.isPressed(P2_UP))	{	// UP
		this.p2.y = Math.max(0, this.p2.y - 5);
	} else if (this.keys.isPressed(P2_LEFT) && this.p2.x > this.width/2 + 20) {	// LEFT
		this.p2.x = Math.max(0, this.p2.x - 5);		
	} else if (this.keys.isPressed(P2_RIGHT)) {	// RIGHT
		this.p2.x = Math.min(this.width - this.p2.width, this.p2.x + 5);
	}

	// left and right collision
	if (this.ball.vx > 0) {
        if (this.p2.x <= this.ball.x + this.ball.width &&
                this.p2.x > this.ball.x - this.ball.vx + this.ball.width) {
            var collisionDiff = this.ball.x + this.ball.width - this.p2.x;
            var k = collisionDiff/this.ball.vx;
            var y = this.ball.vy*k + (this.ball.y - this.ball.vy);
            if (y >= this.p2.y && y + this.ball.height <= this.p2.y + this.p2.height) {
                // collides with right paddle
                this.ball.x = this.p2.x - this.ball.width;
                this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy*k);
                this.ball.vx = -this.ball.vx;
            }
        }
    } else {
        if (this.p1.x + this.p1.width >= this.ball.x &&
        		this.p1.x < this.ball.x - this.ball.vx - this.ball.width) {
            var collisionDiff = this.p1.x + this.p1.width - this.ball.x;
            var k = collisionDiff/-this.ball.vx;
            var y = this.ball.vy*k + (this.ball.y - this.ball.vy);
            if (y >= this.p1.y && y + this.ball.height <= this.p1.y + this.p1.height) {
                // collides with the left paddle
                this.ball.x = this.p1.x + this.p1.width;
                this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy*k);
                this.ball.vx = -this.ball.vx;
            }
        }
    }
 
    // Top and bottom collision
    if ((this.ball.vy < 0 && this.ball.y < 0) ||
            (this.ball.vy > 0 && this.ball.y + this.ball.height > this.height)) {
        this.ball.vy = -this.ball.vy;
    }

    // Scoring
    if (this.ball.x >= this.width)
    	this.score(this.p1);
    else if (this.ball.x + this.ball.width <= 0)
    	this.score(this.p2);
};

Game.prototype.score = function(p) 
{
	// player scores
	p.score++;
	var player = p == this.p1 ? 0 : 1;

	// set ball position
	this.ball.x = this.width/2;
	this.ball.y = p.y + p.height/2;

	// set ball velocity
	this.ball.vy = Math.floor(Math.random()*12 - 6);
	this.ball.vx = 7 - Math.abs(this.ball.vy);
	if (player == 1)
		this.ball.vx *= -1;
};

function Paddle(x, y) {
	this.x = x;
	this.y = y;
	this.width = 10;
	this.height = 50;
	this.score = 0;
}

Paddle.prototype.draw = function(p) 
{
	p.fillRect(this.x, this.y, this.width, this.height);
};

function KeyListener() {
	this.pressedKeys = [];

	this.keydown = function(e) {
		this.pressedKeys[e.keyCode] = true;
	};

	this.keyup = function(e) {
		this.pressedKeys[e.keyCode] = false;
	};

	document.addEventListener("keydown", this.keydown.bind(this));
	document.addEventListener("keyup", this.keyup.bind(this));
};

KeyListener.prototype.isPressed = function(key)
{
	return this.pressedKeys[key] ? true : false;
};

KeyListener.prototype.addKeyPressListener = function(keyCode, callback)
{
	document.addEventListener("keypress", function(e) {
		if (e.keyCode == keyCode) 
			callback(e);
	});
};

function Ball() {
	this.x = 0;
	this.y = 0;
	this.vx = 0;
	this.vy = 0;
	this.width = 10;
	this.height = 10;
}

Ball.prototype.update = function() {
	this.x += this.vx;
	this.y += this.vy;
};

Ball.prototype.draw = function(p) {
	p.fillRect(this.x, this.y, this.width, this.height);
};

function Display(x, y) {
	this.x = x;
	this.y = y;
	this.value = 0;
	// this.width = 10;
	// this.height = 10;
}

Display.prototype.draw = function(p)
{
	p.fillText(this.value, this.x, this.y);
};

// Initialize our game instance
var game = new Game();

function MainLoop() {
	game.update();
	game.draw();

	// Call the main loop again at a frame rate of 30fps
	setTimeout(MainLoop, 33.3333);
}

// Start the game execution
MainLoop();