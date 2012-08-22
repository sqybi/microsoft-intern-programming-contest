var http = require('http');
var express = require('express');
var app = express();

// requesting some page
app.get('/', function(rq, rs) {
    rs.redirect('/index.html');
});
app.get('/:file', function(rq, rs) {
    rs.sendfile(rq.params.file);
});

// start server
var server = http.createServer(app).listen(8080);
var io = require('socket.io').listen(server);
console.log("You can start the game by going to 127.0.0.1:8080, if you want to join the game with another pc go to <pc name or ip of server pc>:8080");

// receive data from clients
var AllClients = new Object();
var AllClientsLength = 0;

var gameRegionSize      = 600;                  // the side length of game region, NEVER change it
var gameRegionGapSize   = 10;                   // size of the gap between game region and canvas (to place the boards), NEVER change it
var ballInitialPosition = gameRegionSize / 2.0; // initial position of ball (both X and Y)
var ballIsOut           = "";                // whether the ball is out of pitch or not
var moveBallInterval    = 10;                   // the interval to move the ball, in millisecond
var moveBallSpeed       = 1;                    // the pixel of movement during the interval
var moveBallSpeedLimit  = 50;                   // moveBallSpeed is always less than or equal to this value
var moveBallIntervarHandler;

var boards = [];
var ball = {
    x: gameRegionSize / 2.0,
    y: gameRegionSize / 2.0,
    angle: RandomAngle()
};


io.sockets.on('connection', function (sock) {
    // a new client joins
    sock.on('join', function (data) {
        // already here, with new socket
        if (AllClients[data.id] != null) {
            console.log("[join] existing user with id '" + data.id + "'");
            AllClients[data.id] = sock;
            sock.emit('join', true);
        }
        // new client
        else {
            if (AllClientsLength < 4) {
                console.log("[join] new user with id '" + data.id + "'");
                AllClients[data.id] = sock;
                var color;
                switch (AllClientsLength) {
                    case 0: {
                        color = "red";
                        break;
                    }
                    case 1: {
                        color = "blue";
                        break;
                    }
                    case 2: {
                        color = "green";
                        break;
                    }
                    case 3: {
                        color = "cyan";
                        break;
                    }
                }
                boards.push({
                    id:       data.id,
                    position: gameRegionSize / 2,
                    size:     40,
                    alive:    true,
                    color:    color,
                    hits:     0
                });
                sock.emit('join', true);
                AllClientsLength++;
                if (AllClientsLength == 4) {
                    // tell all the clients about game starts
                    BroadcastAllClients('start', null);
                    BroadcastAllClientsCurrentBoard();
                    console.log("[start] game starts!");

                    // start to move ball
                    moveBallIntervalHandler = setInterval(MoveBall, moveBallInterval);
                    setInterval(IncreaseMoveBallSpeed, 30000);
                }
            }
            else {
                console.log("[join] server is full, user id '" + data.id + "'");
                sock.emit('join', false);
            }
        }
    });

    // a client sends data to server (not in use)
    sock.on('data', function (data) {
        if(AllClients[data.id] !== null) {
            DataReceivedFromClient(data.msg);
        }
    });

    // board moving information from client
    sock.on('move', function (data) {
        for (var i = 0; i < 4; ++i) {
            if (boards[i] != null && boards[i].alive && boards[i].id == data.id) {
                boards[i].position = data.msg;
                break;
            }
        }
    })
});


/*
 * Functions
 */

function RandomAngle() {
    return Math.random() * 2 * Math.PI;
}

// this function is abandoned
function IncreaseMoveBallInterval() {
    moveBallInterval = moveBallInterval / 1.3;
    if (moveBallInterval < 1) {
        moveBallInterval = 1;
    }
    if (moveBallIntervalHandler != null) {
        clearInterval(moveBallIntervalHandler);
    }
    moveBallIntervalHandler = setInterval(MoveBall, moveBallInterval >> 0);
}

function IncreaseMoveBallSpeed() {
    moveBallSpeed = moveBallSpeed * 1.3;
    if (moveBallSpeed > moveBallSpeedLimit) {
        moveBallSpeed = moveBallSpeedLimit;
    }
    else {
        console.log("[ball] the ball is becoming faster with a speed " + moveBallSpeed + " per " + moveBallInterval + " milliseconds");
    }
}

function CheckBallPosition(x, y)
{
    var position = "";
    if (x < 0) {
        position += "W";
    }
    else if (x >= gameRegionSize) {
        position += "E";
    }
    if (y < 0) {
        position += "N";
    }
    else if (y >= gameRegionSize) {
        position += "S";
    }
    return position;
}

function SetDeath(board) {
    board.alive = false;
    board.position = gameRegionSize / 2;
    board.size = gameRegionSize / 2;
    console.log("[death] user with id '" + board.id + "' is dead");
}

function MoveBall() {
    ball.x += Math.cos(ball.angle) * moveBallSpeed;
    ball.y -= Math.sin(ball.angle) * moveBallSpeed;
    //console.log(Math.cos(ball.angle), Math.sin(ball.angle), ball.angle)

    var ballPosition = CheckBallPosition(ball.x, ball.y);
    if (ballIsOut.length <= ballPosition.length && ballIsOut != ballPosition) {
        boardLeftBoundary = [];
        boardRightBoundary = [];
        boardLeftBoundary[0] = boards[0].position - boards[0].size;
        boardRightBoundary[0] = boards[0].position + boards[0].size;
        boardLeftBoundary[1] = gameRegionSize - 1 - boards[1].position + boards[1].size;
        boardRightBoundary[1] = gameRegionSize - 1 - boards[1].position - boards[1].size;
        boardLeftBoundary[2] = gameRegionSize - 1 - boards[2].position + boards[2].size;
        boardRightBoundary[2] = gameRegionSize - 1 - boards[2].position - boards[2].size;
        boardLeftBoundary[3] = boards[3].position - boards[3].size;
        boardRightBoundary[3] = boards[3].position + boards[3].size;
        var death = false;
        switch (ballPosition) {
            case "WN": {
                if (ball.x < boardRightBoundary[2]) {
                    if (boards[2].alive) {
                        SetDeath(boards[2]);
                        death = true;
                    }
                }
                else if (boards[2].alive) {
                    boards[2].hits++;
                }
                if (ball.y < boardLeftBoundary[3]) {
                    if (boards[3].alive) {
                        SetDeath(boards[3]);
                        death = true;
                    }
                }
                else if (boards[3].alive) {
                    boards[3].hits++;
                }
                if (death) {
                    ball.x = ballInitialPosition;
                    ball.y = ballInitialPosition;
                    ball.angle = RandomAngle();
                }
                else {
                    ball.angle = Math.PI * 7 / 4;
                }
                break;
            }

            case "EN": {
                if (ball.x > boardLeftBoundary[2]) {
                    if (boards[2].alive) {
                        SetDeath(boards[2]);
                        death = true;
                    }
                }
                else if (boards[2].alive) {
                    boards[2].hits++;
                }
                if (ball.y < boardRightBoundary[1]) {
                    if (boards[1].alive) {
                        SetDeath(boards[1]);
                        death = true;
                    }
                }
                else if (boards[1].alive) {
                    boards[1].hits++;
                }
                if (death) {
                    ball.x = ballInitialPosition;
                    ball.y = ballInitialPosition;
                    ball.angle = RandomAngle();
                }
                else {
                    ball.angle = Math.PI * 5 / 4;
                }
                break;
            }

            case "ES": {
                if (ball.x > boardRightBoundary[0]) {
                    if (boards[0].alive) {
                        SetDeath(boards[0]);
                        death = true;
                    }
                }
                else if (boards[0].alive) {
                    boards[0].hits++;
                }
                if (ball.y > boardLeftBoundary[1]) {
                    if (boards[1].alive) {
                        SetDeath(boards[1]);
                        death = true;
                    }
                }
                else if (boards[1].alive) {
                    boards[1].hits++;
                }
                if (death) {
                    ball.x = ballInitialPosition;
                    ball.y = ballInitialPosition;
                    ball.angle = RandomAngle();
                }
                else {
                    ball.angle = Math.PI * 3 / 4;
                }
                break;
            }

            case "WS": {
                if (ball.x < boardLeftBoundary[0]) {
                    if (boards[0].alive) {
                        SetDeath(boards[0]);
                        death = true;
                    }
                }
                else if (boards[0].alive) {
                    boards[0].hits++;
                }
                if (ball.y > boardRightBoundary[3]) {
                    if (boards[3].alive) {
                        SetDeath(boards[3]);
                        death = true;
                    }
                }
                else if (boards[3].alive) {
                    boards[3].hits++;
                }
                if (death) {
                    ball.x = ballInitialPosition;
                    ball.y = ballInitialPosition;
                    ball.angle = RandomAngle();
                }
                else {
                    ball.angle = Math.PI * 1 / 4;
                }
                break;
            }

            case "S": {
                if (ball.x < boardLeftBoundary[0] || ball.x > boardRightBoundary[0]) {
                    if (boards[0].alive) {
                        SetDeath(boards[0]);
                        death = true;
                    }
                }
                else if (boards[0].alive) {
                    boards[0].hits++;
                }
                if (death) {
                    ball.x = ballInitialPosition;
                    ball.y = ballInitialPosition;
                    ball.angle = RandomAngle();
                }
                else {
                    ball.angle = ((boardRightBoundary[0] - ball.x) / (boardRightBoundary[0] - boardLeftBoundary[0]) * 2 + 1) / 4 * Math.PI;
                }
                break;
            }

            case "E": {
                if (ball.y > boardLeftBoundary[1] || ball.y < boardRightBoundary[1]) {
                    if (boards[1].alive) {
                        SetDeath(boards[1]);
                        death = true;
                    }
                }
                else if (boards[1].alive) {
                    boards[1].hits++;
                }
                if (death) {
                    ball.x = ballInitialPosition;
                    ball.y = ballInitialPosition;
                    ball.angle = RandomAngle();
                }
                else {
                    ball.angle = ((ball.y - boardRightBoundary[1]) / (boardLeftBoundary[1] - boardRightBoundary[1]) * 2 + 3) / 4 * Math.PI;
                }
                break;
            }

            case "N": {
                if (ball.x > boardLeftBoundary[2] || ball.x < boardRightBoundary[2]) {
                    if (boards[2].alive) {
                        SetDeath(boards[2]);
                        death = true;
                    }
                }
                else if (boards[2].alive) {
                    boards[2].hits++;
                }
                if (death) {
                    ball.x = ballInitialPosition;
                    ball.y = ballInitialPosition;
                    ball.angle = RandomAngle();
                }
                else {
                    ball.angle = ((ball.x - boardRightBoundary[2]) / (boardLeftBoundary[2] - boardRightBoundary[2]) * 2 + 5) / 4 * Math.PI;
                }
                break;
            }

            case "W": {
                if (ball.y < boardLeftBoundary[3] || ball.y > boardRightBoundary[3]) {
                    if (boards[3].alive) {
                        SetDeath(boards[3]);
                        death = true;
                    }
                }
                else if (boards[3].alive) {
                    boards[3].hits++;
                }
                if (death) {
                    ball.x = ballInitialPosition;
                    ball.y = ballInitialPosition;
                    ball.angle = RandomAngle();
                }
                else {
                    ball.angle = ((boardRightBoundary[3] - ball.y) / (boardRightBoundary[3] - boardLeftBoundary[3]) * 2 + 7) / 4 * Math.PI;
                }
                break;
            }
        }
    }
    ballIsOut = ballPosition;

    //console.log(ball);
    BroadcastAllClientsCurrentBoard();

    if (death) {
        var totalAlive = 0;
        for (var i = 0; i < 4; ++i) {
            if (boards[i].alive) {
                ++totalAlive;
            }
        }
        if (totalAlive <= 1) {
            // game ends, prepare for another game
            BroadcastAllClients("end", null);
            console.log("[end] end of game!");
            if (moveBallIntervalHandler != null) {
                clearInterval(moveBallIntervalHandler);
            }
            AllClients = new Object();
            AllClientsLength = 0;
            boards = [];
            ballIsOut = "";
            moveBallInterval = 10;
            moveBallSpeed = 1;
        }
    }
}

function DataReceivedFromClient(data) {
    for (board in boards) {
        if (boards[board].id == data.id) {
            boards[board] = data;
        }
    }

    BroadcastAllClientsCurrentBoard();
}

function BroadcastAllClientsCurrentBoard() {
    BroadcastAllClients('data', {
        ball: {
            x: ball.x >> 0,
            y: ball.y >> 0
        },
        boards: boards
    });
}

function BroadcastAllClients(type, data) {
    for (client in AllClients) {
        if (AllClients[client]) {
            AllClients[client].emit(type, data);
        }
    }
}
