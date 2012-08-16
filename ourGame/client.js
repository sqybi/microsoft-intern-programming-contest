// /**
//  * Just the minimum code you want to start with, play around with draw and the ctx to draw interesting stuff first,
//  * then add the keyboard input from keyPress, use recieve and server.broadcast to add to talk with other players
//  * playing the same game and add multiplayer functionality,
//  */
// x1 = 20;
// y1 = 20;
// tx1 = 5;
// ty1 = 5;

// x2 = 980;
// y2 = 580;
// tx2 = -10;
// ty2 = -3;

// x3 = 20;
// y3 = 580;
// tx3 = 15;
// ty3 = 0;

// var p1 = new Image();
// var p2 = new Image();
// var p3 = new Image();
// p1.src = "1.png";
// p2.src = "2.png";
// p3.src = "3.png";

// m = 0;

// function draw() {
// 	ctx.clearRect(0,0,1000,600);
	
// 	// ctx.beginPath();
// 	// ctx.arc(x1,y1,10,0,Math.PI*2,true);
// 	// ctx.fill();

// 	// ctx.beginPath();
// 	// ctx.arc(x2,y2,10,0,Math.PI*2,true);
// 	// ctx.fill();

// 	// ctx.beginPath();
// 	// ctx.arc(x3,y3,10,0,Math.PI*2,true);
// 	// ctx.fill();

// 	ctx.drawImage(p1, x1, y1);
// 	ctx.drawImage(p2, x2, y2);
// 	ctx.drawImage(p3, x3, y3);

//     // ctx.fillStyle = "blue"; 
//     // ctx.font="24pt Helvetica"; 
//     // ctx.fillText(m, 10, 250); 

//     if (window.requestAnimationFrame)
//     	window.requestAnimationFrame(draw);
//     else if (window.msRequestAnimationFrame)
//     	window.msRequestAnimationFrame(draw);
//     else if (window.webkitRequestAnimationFrame)
//     	window.webkitRequestAnimationFrame(draw);
//     else if (window.mozRequestAnimationFrame)
//     	window.mozRequestAnimationFrame(draw);
//     else if (window.oRequestAnimationFrame)
//     	window.oRequestAnimationFrame(draw);
// }

// function move()
// {
// 	x1 += tx1;
// 	y1 += ty1;

// 	x2 += tx2;
// 	y2 += ty2;

// 	x3 += tx3;
// 	y3 += ty3;
// }

// setInterval(move, 50);
// //setInterval(changeMessage, 1000);

// draw();
// //setInterval(draw, 20); //run draw every 60 ms

// function changeMessage()
// {
// 	server.broadcast(m);
// 	m++;
// }

// function keyPress(code) {
// 	//use this function to get all the key strokes, the code can be the following:
// 	// right, left, up, down, a, b, c, ... , z, 1, 2, ... , 9,  (a space for space bar)

// }
// function recieve(msg) {
// 	//recieve messages from other clients in this function, to send messages use server.broadcast(msg)
// 	//note that you will also recieve the message you broadcasted
// 	m = msg;
// }


function drawBlock(x, y) {
	ctx.fillStyle = "green";
	var rx = x * block_size; //real coordinates in pixels
	var ry = y * block_size;
	ctx.fillRect(rx, ry, block_size, block_size);
	ctx.strokeStyle = "white";
	ctx.strokeRect(rx, ry, block_size, block_size);
}
var Snake = function(x, y, direction, length) {
	this.id = guidGenerator();
	this.blocks = [];
	this.direction = direction;
	this.score = 0;
	this.deleted = false; //would be usefull in collision detection
	for (var i = length - 1; i >= 0; i--) {
		this.blocks.push({
			x: x + i,
			y: 0
		});
	}
}
Snake.prototype.draw = function() {
	for (var i = 0; i < this.blocks.length; i++) {
		drawBlock(this.blocks[i].x, this.blocks[i].y);
	}
}
var get_random_point = function() {
	var max_x = (width - block_size)/block_size; //get max width in our space
	var max_y = (height - block_size)/block_size;
	return {
		x: Math.round(Math.random() * max_x),
		y: Math.round(Math.random() * max_y)
	};
}
var snakes, foods;
var block_size = 20;
var draw_loop = null;

function start()
{
	snakes = new Array();
	snakes.push(new Snake(0, 0, "right", 5));

	broadcast({"id" : clientID, "msg" : "Good"});

	foods = new Array();
	foods.push(get_random_point());
	if (draw_loop)
		clearInterval(draw_loop);
	draw_loop = setInterval(draw, 70);
}
//start();
function clr_canvas() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, width, height);
}
function draw()
{
	clr_canvas();
	draw_shapes();
	move_snakes();
	delete_unnecessary();

	ctx.fillStyle = "white";
	var score_text = "Score: " + snakes[0].score;
	ctx.fillText(score_text, 5, height - 5);
}
var draw_shapes = function() {
	//draw snakes
	for (var i = 0; i < snakes.length; i++)
		snakes[i].draw();

	//draw foods
	for (var i = 0; i < foods.length; i++)
		drawBlock(foods[i].x, foods[i].y);
}
var move_snakes = function() {
	//try to move snakes, and check collisions with food
	for (var i = 0; i < snakes.length; i++) {
		var new_x = snakes[i].blocks[0].x;
		var new_y = snakes[i].blocks[0].y;
		var direction = snakes[i].direction;
		if (direction == "right") new_x++;
		if (direction == "left") new_x--;
		if (direction == "down") new_y++;
	   if (direction == "up") new_y--;
		//check if outside the canvas, if yes then revert it through the other direction
		if (new_x < 0)
			new_x = (width - block_size) / block_size;

		if (new_y < 0)
			new_y = (height - block_size) / block_size;

		if (new_x >= width / block_size)
			new_x = 0;

		if (new_y >= height / block_size)
			new_y = 0;

		if (get_food(new_x, new_y)) {
			//collision with food, include the food block in the snake body, increase the score
			snakes[i].score++;
			delete_food(new_x, new_y);
			foods.push(get_random_point());
		}
		else {
			//remove the tail as it will be added in the head
			snakes[i].blocks.pop();
		}
		snakes[i].blocks.unshift({
			x: new_x,
			y: new_y
		});
	}

	//now check collision between the snakes, and if yes then mark them as deleted!!!
	for (var i = 0; i < snakes.length; i++) {
		var head = snakes[i].blocks.shift();
		if (get_snake(head.x, head.y)) {
			//mark as delete to get deleted in near future
			snakes[i].deleted = true;
		};
		snakes[i].blocks.unshift(head);
	}
}

var delete_unnecessary = function() {
	for (var i = 0; i < snakes.length; i++) {
		if (snakes[i].deleted) {
			console.log('deleting a snake!!!');
			snakes.splice(i, 1);
			delete_unnecessary();
			return;
		}
	}
}

var get_snake = function(x, y) {
	for (var i = 0; i < snakes.length; i++) {
		for (var j = 0; j < snakes[i].blocks.length; j++) {
			var point = snakes[i].blocks[j];
			if (x == point.x && y == point.y && !snakes[i].deleted)
				return snakes[i];
		}
	}
	return null;
}
var get_food = function(x, y) {
	for (var i = 0; i < foods.length; i++) {
		if (foods[i].x == x && foods[i].y == y) {
			return foods[i];
		}
	}
	return null;
}
var delete_food = function(x, y) {
	for (var i = 0; i < foods.length; i++) {
		if (foods[i].x == x && foods[i].y == y) {
			foods.splice(i, 1);
			return;
		}
	}
}


function keyPress(code) {
	//use this function to get all the key strokes, the code can be the following:
	// right, left, up, down, a, b, c, ... , z, 1, 2, ... , 9,  (a space for space bar)
	if (code == "left" && snakes[0].direction != "right")
		snakes[0].direction = "left";
	if (code == "right" && snakes[0].direction != "left")
		snakes[0].direction = "right";
	if (code == "up" && snakes[0].direction != "down")
		snakes[0].direction = "up";
	if (code == "down" && snakes[0].direction != "up")
		snakes[0].direction = "down";
}
function recieve(msg) {
    console.log(msg);
}

jQuery(document).ready(function () {
    $(document).mousemove(function (e) {
        $('#status').html(e.pageX + ', ' + e.pageY);
        if (e.pageX > window.width - hero.width) {
            hero.x = window.width - hero.width;
        } else {
            hero.x = e.pageX;
        }
    });
})

var stick_height = 20;
var stick_width_default = 100;

var ball_x_speed_defaul = 2;
var ball_y_speed_defaul = 2;
var ball_length_defaul = 10;

function Stick() {
    this.x = 0;
    this.y = height - stick_height * 2;
    this.width = window.stick_width_default;
    this.height = window.stick_height;

    this.draw = function (ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
}

function Ball() {
    this.x = 0;
    this.y = Math.random() * window.height;
    this.width = ball_length_defaul;
    this.height = ball_length_defaul;
    this.xspeed = ball_x_speed_defaul;
    this.yspeed = ball_y_speed_defaul;

    this.draw = function (ctx) {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    this.move = function () {
        this.x += this.xspeed;
        this.y += this.yspeed;
    }
}

var hero = new Stick();
var ball = new Ball();

var drawable_object = new Object();
var movable_object = new Object();

drawable_object['player'] = hero;
drawable_object['ball'] = ball;

movable_object['ball'] = ball;

var current_ctx = 0;

function my_draw() {
    ctx[1 - current_ctx].clearRect(0, 0, window.width, window.height);
    for (drawable in drawable_object) {
        drawable_object[drawable].draw(ctx[1 - current_ctx]);
    }
    canvas[1 - current_ctx].style.visibility = 'visible';
    canvas[current_ctx].style.visibility = 'hidden';
    current_ctx = 1 - current_ctx;
    for (movable in movable_object) {
        movable_object[movable].move();
    }

    if (ball.x >= hero.x && ball.x <= hero.x + hero.width && ball.y >= hero.y && ball.y <= hero.y + hero.height) {
        ball.yspeed = -ball.yspeed * 5;
    }
}

var my_draw_loop = null;

function my_start() {
    // if (my_draw_loop)
    //     clearInterval(my_draw_loop);
    // my_draw_loop = setInterval(my_draw, 10);
    my_draw();
    if (window.requestAnimationFrame)
		window.requestAnimationFrame(my_start);
	else if (window.msRequestAnimationFrame)
		window.msRequestAnimationFrame(my_start);
	else if (window.webkitRequestAnimationFrame)
		window.webkitRequestAnimationFrame(my_start);
	else if (window.mozRequestAnimationFrame)
		window.mozRequestAnimationFrame(my_start);
	else if (window.oRequestAnimationFrame)
		window.oRequestAnimationFrame(my_start);

}

my_start();