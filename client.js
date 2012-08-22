/*************
 * Variables *
 *************/

var serverURL         = 'http://localhost';   // URL of server

var ctxWidth          = ctx[0].canvas.width;  // width of the whole canvas
var ctxHeight         = ctx[0].canvas.height; // height of the whole canvas
var gameRegionSize    = 600;                  // the side length of game region, NEVER change it
var gameRegionGapSize = 10;                   // size of the gap between game region and canvas (to place the boards), NEVER change it
var boardThickness    = 9;                    // thickness of the boards
var ballSize          = 7;                    // radius of the ball

// status of the game
//   0: game not started yet
//   1: game is running
//   2: you are dead!
//   -1: server is full, or connection error
var gameStatus = 0;

var ball = {
    x: gameRegionSize / 2,
    y: gameRegionSize / 2
};
var boards = [
    {
        id:       clientID,
        position: gameRegionSize / 2,
        size:     40,
        alive:    true,
        color:    "red"
    },
    {
        id:       "",
        position: gameRegionSize / 2,
        size:     gameRegionSize / 2,
        alive:    true,
        color:    "blue"
    },
    {
        id:       "",
        position: gameRegionSize / 2,
        size:     gameRegionSize / 2,
        alive:    true,
        color:    "green"
    },
    {
        id:       "",
        position: gameRegionSize / 2,
        size:     gameRegionSize / 2,
        alive:    true,
        color:    "cyan"
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
        case "left": {
            // do something
            break;
        }

        case "right": {
            // do something
            break;
        }

        default:
            // do nothing
    }
}

//
// a function needed here to control the board with mouse
//

function FunctionNeededHere() {
    // body of this function

    // do not forget to send the new position information to server when changed
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
    ctx.fillStyle = boards[0].color;
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
    ctx.fillStyle = boards[1].color;
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
    ctx.fillStyle = boards[2].color;
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
    ctx.fillStyle = boards[3].color;
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
    // Not implemented
}

//
// when a new game data is coming
//

function ReceiveNewGameData(data) {
    // update local data
    var remotePos = -1;
    for (var i = 0; i < 4; ++i) {
        if (clientID == data.boards[i].id) {
            remotePos = i;
            break;
        }
    }
    if (remotePos == -1 || data.boards.length != 4) {
        // there is something wrong with this data
        return;
    }
    console.log(clientID, data.boards[remotePos].id, remotePos);
    for (var i = 0; i < 4; ++i) {
        boards[i] = data.boards[(remotePos + i) % 4];
    }
    switch (remotePos) {
        case 0: {
            ball.x = data.ball.x;
            ball.y = data.ball.y;
            break;
        }

        case 1: {
            ball.x = gameRegionSize - 1 - data.ball.y;
            ball.y = data.ball.x;
            break;
        }

        case 2: {
            ball.x = gameRegionSize - 1 - data.ball.x;
            ball.y = gameRegionSize - 1 - data.ball.y;
            break;
        }

        case 3: {
            ball.x = data.ball.y;
            ball.y = gameRegionSize - 1 - data.ball.x;
            break;
        }
    }

    // check for death
    if (gameStatus == 1 && !boards[0].alive) {
        gameStatus = 2;
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

        // server is full or connection error
        case -1: {
            backgroundCtx.textBaseline = "middle";
            backgroundCtx.textAlign = "center";
            backgroundCtx.fillStyle = "red";
            backgroundCtx.fillText("Server is already full, or you didn't connect to a server!", gameRegionGapSize + gameRegionSize / 2 + 2, gameRegionGapSize + gameRegionSize / 2 + 2);
            DrawInfoArea(backgroundCtx);

            break;
        }

        // game not started yet
        case 0: {
            backgroundCtx.textBaseline = "middle";
            backgroundCtx.textAlign = "center";
            backgroundCtx.fillStyle = "black";
            backgroundCtx.fillText("Waiting for other participants...", gameRegionGapSize + gameRegionSize / 2 + 2, gameRegionGapSize + gameRegionSize / 2 + 2);
            DrawInfoArea(backgroundCtx);

            break;
        }

        // game is running
        case 1: {
            DrawGameArea(backgroundCtx);
            DrawInfoArea(backgroundCtx);

            break;
        }

        // you are dead
        case 2: {
            DrawGameArea(backgroundCtx);

            backgroundCtx.textBaseline = "middle";
            backgroundCtx.textAlign = "center";
            backgroundCtx.fillStyle = "red";
            backgroundCtx.fillText("You are dead...", gameRegionGapSize + gameRegionSize / 2 + 2, gameRegionGapSize + gameRegionSize / 2 + 2);

            DrawInfoArea(backgroundCtx);

            break;
        }

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

var socket;

try {
    socket = io.connect(serverURL);
}
catch (ex) {
    //server not running
    alert('Error when connecting server!');
    gameStatus = -1;
}


// receive data from server
socket.on('data', function (data) {
    ReceiveNewGameData(data);
});

socket.on('join', function (data) {
    if (!data) {
        gameStatus = -1;
    }
});

socket.on('start', function (data) {
    if (gameStatus == 0) {
        gameStatus = 1;
    }
});



// try to join
socket.emit('join', {
    id: clientID
});

// start rendering
NewFrame(RenderingLoop);
