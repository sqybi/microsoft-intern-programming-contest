/*************
 * Variables *
 *************/

var ctxWidth          = ctx[0].canvas.width;  // width of the whole canvas
var ctxHeight         = ctx[0].canvas.height; // height of the whole canvas
var gameRegionSize    = 600;                  // the side length of game region, NEVER change it
var gameRegionGapSize = 10;                   // size of the gap between game region and canvas (to place the boards), NEVER change it
var boardThickness    = 9;                    // thickness of the boards
var ballSize          = 7;                   // radius of the ball

// status of the game
//   0: game not started yet
//   1: game is running
//   2: you are dead!
var gameStatus = 2;

var ball = {
    x: gameRegionSize / 2,
    y: gameRegionSize / 2
};
var boards = [
    {
        id:       clientID,
        position: gameRegionSize / 2,
        size:     40
    },
    {
        id:       "",
        position: gameRegionSize / 2,
        size:     gameRegionSize
    },
    {
        id:       "",
        position: gameRegionSize / 2,
        size:     gameRegionSize
    },
    {
        id:       "",
        position: gameRegionSize / 2,
        size:     gameRegionSize
    }
];

/*************
 * Functions *
 *************/

//
// action when key pressed
// currently no action -- control the game with mouse
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
// a function needed here to control the board with mouse
//

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
// Draw the game area
//

function DrawGameArea(ctx) {
    // draw all the boards by anticlockwise order
    var boardLeftBoundary, boardRightBoundary;

    boardLeftBoundary = boards[0].position - boards[0].size;
    boardRightBoundary = boards[0].position + boards[0].size;
    if (boardLeftBoundary < 0) {
        boardLeftBoundary = 0;
    }
    if (boardRightBoundary >= gameRegionSize) {
        boardRightBoundary = gameRegionSize - 1;
    }
    ctx.fillStyle = "red";
    ctx.fillRect(boardLeftBoundary + gameRegionGapSize + 2, gameRegionSize + gameRegionGapSize + 3,
                 boardRightBoundary - boardLeftBoundary + 1, boardThickness);

    boardLeftBoundary = gameRegionSize - 1 - boards[1].position + boards[1].size;
    boardRightBoundary = gameRegionSize - 1 - boards[1].position - boards[1].size;
    if (boardLeftBoundary >= gameRegionSize) {
        boardLeftBoundary = gameRegionSize - 1;
    }
    if (boardRightBoundary < 0) {
        boardRightBoundary = 0;
    }
    ctx.fillStyle = "blue";
    ctx.fillRect(gameRegionSize + gameRegionGapSize + 3, boardRightBoundary + gameRegionGapSize + 2,
                 boardThickness, boardLeftBoundary - boardRightBoundary + 1);

    boardLeftBoundary = gameRegionSize - 1 - boards[2].position + boards[2].size;
    boardRightBoundary = gameRegionSize - 1 - boards[2].position - boards[2].size;
    if (boardLeftBoundary >= gameRegionSize) {
        boardLeftBoundary = gameRegionSize - 1;
    }
    if (boardRightBoundary < 0) {
        boardRightBoundary = 0;
    }
    ctx.fillStyle = "green";
    ctx.fillRect(boardRightBoundary + gameRegionGapSize + 2, gameRegionGapSize - boardThickness + 1,
                 boardLeftBoundary - boardRightBoundary + 1, boardThickness);

    boardLeftBoundary = boards[3].position - boards[3].size;
    boardRightBoundary = boards[3].position + boards[3].size;
    if (boardLeftBoundary < 0) {
        boardLeftBoundary = 0;
    }
    if (boardRightBoundary >= gameRegionSize) {
        boardRightBoundary = gameRegionSize - 1;
    }
    ctx.fillStyle = "cyan";
    ctx.fillRect(gameRegionGapSize - boardThickness + 1, boardLeftBoundary + gameRegionGapSize + 2,
                 boardThickness, boardRightBoundary - boardLeftBoundary + 1);

    // draw the bricks (no bricks yet)

    // draw the ball
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(gameRegionGapSize + 2 + ball.x, gameRegionGapSize + 2 + ball.y,
            ballSize, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

//
// Draw the information area
//

function DrawInfoArea(ctx) {

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
    else { // No requestAnimationFrame feature
        NewFrame = function() {};
        window.setInterval(RenderingLoop, 16.7);
    }
}

//
// rendering loop
//

var RenderingLoop = function() {

    // select canvas
    currentCanvas = currentCanvas ^ 1;
    allCanvas[currentCanvas].visible = true;
    allCanvas[currentCanvas ^ 1].visible = false;

    // draw on the background canvas
    var backgroundCtx = ctx[currentCanvas ^ 1];

    backgroundCtx.clearRect(0, 0, ctxWidth, ctxHeight);

    backgroundCtx.lineWidth = 1;
    backgroundCtx.strokeStyle = "black";
    backgroundCtx.strokeRect(0, 0, ctxWidth, ctxHeight);
    backgroundCtx.strokeRect(gameRegionGapSize + 1, gameRegionGapSize + 1, gameRegionSize + 2, gameRegionSize + 2);
    backgroundCtx.beginPath();
    backgroundCtx.moveTo(gameRegionSize + gameRegionGapSize * 2 + 3, 0);
    backgroundCtx.lineTo(gameRegionSize + gameRegionGapSize * 2 + 3, ctxHeight);
    backgroundCtx.stroke();

    switch (gameStatus) {

        // game not started yet
        case 0:
            backgroundCtx.textBaseline = "middle";
            backgroundCtx.textAlign = "center";
            backgroundCtx.fillStyle = "black";
            backgroundCtx.fillText("Waiting for other participants...", gameRegionGapSize + gameRegionSize / 2 + 2, gameRegionGapSize + gameRegionSize / 2 + 2);
            DrawInfoArea(backgroundCtx);

            break;

        // game is running
        case 1:
            DrawGameArea(backgroundCtx);
            DrawInfoArea(backgroundCtx);

            break;

        // you are dead
        case 2:
            DrawGameArea(backgroundCtx);

            backgroundCtx.textBaseline = "middle";
            backgroundCtx.textAlign = "center";
            backgroundCtx.fillStyle = "red";
            backgroundCtx.fillText("You are dead...", gameRegionGapSize + gameRegionSize / 2 + 2, gameRegionGapSize + gameRegionSize / 2 + 2);

            DrawInfoArea(backgroundCtx);

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

NewFrame(RenderingLoop);
