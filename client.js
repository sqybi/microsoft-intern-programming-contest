/*************
 * Variables *
 *************/

var ctxWidth          = ctx[0].canvas.width;  // width of the whole canvas
var ctxHeight         = ctx[0].canvas.height; // height of the whole canvas
var gameRegionSize    = 600;                  // the side length of game region
var gameRegionGapSize = 10;                   // size of the gap between game region and canvas (to place the boards)
var boardThickness    = 8;                    // thickness of the boards

// status of the game
//   0: game not started yet
//   1: game is running
//   2: you are dead!
var gameStatus = 0;

var ball = {
    x: 0,
    y: 0
};
var boards = [{
    id = clientID,
    position = gameBoardSize / 2,
    size = 
}];

/*************
 * Functions *
 *************/

//
// action when key pressed
//
// use this function to get all the key strokes, the code can be the following:
// right, left, up, down, a, b, c, ... , z, 1, 2, ... , 9,  (a space for space bar)
//

function KeyPress(code) {
    switch (code) {
        case "left":
            // do something
            break;

        case "right":
            // do something
            break;

        default:
            // do nothing
    }
}

//
// action when a message is coming
//
// recieve messages from other clients in this function, to send messages use server.broadcast(msg)
// note that you will also recieve the message you broadcasted
//

function Recieve(msg) {
    if (msg.id != clientID)
    {
        r = msg.data;
        receiveText = "Latest data received from client id: " + msg.id;
    }
}

//
// several functions to update information with the data from server
//

function UpdateBallInformation(x, y) {
    ball.x = x;
    ball.y = y;
}

function UpdateBoardInformation(id, position, size) {
    // no need to update local board position
    if (id != clientID) {
        for (board in boards) {
            if (boards[board] != null && boards[board].id == id) {
                boards[board].position = position;
                boards[board].size = size;
                break;
            }
        }
    }
}

//
// request a new frame
//

var NewFrame = function() {
    if (window.requestAnimationFrame) {
        window.requestAnimationFrame(RenderingLoop);
    }
    else if (window.msRequestAnimationFrame) {
        window.msRequestAnimationFrame(RenderingLoop);
    }
    else if (window.webkitRequestAnimationFrame) {
        window.webkitRequestAnimationFrame(RenderingLoop);
    }
    else if (window.mozRequestAnimationFrame) {
        window.mozRequestAnimationFrame(RenderingLoop);
    }
    else if (window.oRequestAnimationFrame) {
        window.oRequestAnimationFrame(RenderingLoop);
    }
    else {
        NewFrame = function() {};
        window.setInterval(RenderingLoop, 16.7);
    }
}

//
// rendering loop
//

var RenderingLoop = function() {

    // clear the whole panel
    ctx.clearRect(0, 0, ctxWidth, ctxHeight);

    // select canvas
    currentCanvas = currentCanvas ^ 1;
    allCanvas[currentCanvas].visible = true;
    allCanvas[currentCanvas ^ 1].visible = false;

    // draw on the background canvas
    var backgroundCtx = ctx[currentCanvas ^ 1];
    switch (gameStatus) {

        // game not started yet
        case 0:

            break;

        // game is running
        case 1:

            break;

        // you are dead
        case 2:

            break;

        // must be something wrong if you get here
        default:
            // do nothing
    }

    // request a new frame
    NewFrame();
}

/*************
 * Main code *
 *************/

NewFrame(renderingLoop);
