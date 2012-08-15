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

	foods = new Array();
	foods.push(get_random_point());
	if (draw_loop)
		clearInterval(draw_loop);
	draw_loop = setInterval(draw, 70);
}
start();
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
	//recieve messages from other clients in this function, to send messages use server.broadcast(msg)
	//note that you will also recieve the message you broadcasted
}
