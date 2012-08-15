/**
 * Just the minimum code you want to start with, play around with draw and the ctx to draw interesting stuff first,
 * then add the keyboard input from keyPress, use recieve and server.broadcast to add to talk with other players
 * playing the same game and add multiplayer functionality,
 */
x1 = 20;
y1 = 20;
tx1 = 5;
ty1 = 5;

x2 = 980;
y2 = 580;
tx2 = -10;
ty2 = -3;

x3 = 20;
y3 = 580;
tx3 = 15;
ty3 = 0;

var p1 = new Image();
var p2 = new Image();
var p3 = new Image();
p1.src = "1.png";
p2.src = "2.png";
p3.src = "3.png";

m = 0;
r = 0;

function draw() {
	ctx.clearRect(0,0,1000,600);
	
	// ctx.beginPath();
	// ctx.arc(x1,y1,10,0,Math.PI*2,true);
	// ctx.fill();

	// ctx.beginPath();
	// ctx.arc(x2,y2,10,0,Math.PI*2,true);
	// ctx.fill();

	// ctx.beginPath();
	// ctx.arc(x3,y3,10,0,Math.PI*2,true);
	// ctx.fill();

	ctx.drawImage(p1, x1, y1);
	ctx.drawImage(p2, x2, y2);
	ctx.drawImage(p3, x3, y3);

	ctx.fillStyle = "blue"; 
    ctx.font="24pt Helvetica"; 
    ctx.fillText(m, 100, 100); 

    ctx.fillStyle = "red"; 
    ctx.font="24pt Helvetica"; 
    ctx.fillText(r, 100, 200); 
}

function move()
{
	x1 += tx1;
	y1 += ty1;

	x2 += tx2;
	y2 += ty2;

	x3 += tx3;
	y3 += ty3;
}

setInterval(draw, 20); //run draw every 60 ms
setInterval(move, 50);
setInterval(changeMessage, 1000);

function changeMessage()
{
	m++;
	broadcast(m);
}

function keyPress(code) {
	//use this function to get all the key strokes, the code can be the following:
	// right, left, up, down, a, b, c, ... , z, 1, 2, ... , 9,  (a space for space bar)
	r++;
}
function recieve(msg) {
	//recieve messages from other clients in this function, to send messages use server.broadcast(msg)
	//note that you will also recieve the message you broadcasted
	r = msg;
}
