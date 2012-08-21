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

var gameRegionSize    = 600;                  // the side length of game region, NEVER change it
var gameRegionGapSize = 10;                   // size of the gap between game region and canvas (to place the boards), NEVER change it
var boards            = [];
var ball              = {
                            x: gameRegionSize / 2.0,
                            y: gameRegionSize / 2.0,
                            angle: Math.random() * 2 * Math.PI
                        };
var ballIsOut         = false;                // whether the ball is out of pitch or not
var moveBallInterval  = 100;                  // the interval to move the ball one pixel, in millisecond

io.sockets.on('connection', function (sock) {
    // a new client joins
    sock.on('join', function (data) {
        // already here, with new socket
        if (AllClients[data.id] != null) {
            AllClients[data.id] = sock;
            sock.emit('join', true);
        }
        // new client
        else {
            console.log(AllClientsLength);
            if (AllClientsLength < 4) {
                AllClients[data.id] = sock;
                boards.push({
                    id:       data.id,
                    position: gameRegionSize / 2,
                    size:     40,
                    alive:    true
                });
                sock.emit('join', true);
                AllClientsLength++;
                if (AllClientsLength == 4) {
                    // tell all the clients about game starts
                    BroadcastAllClients('start', null);
                    BroadcastAllClientsCurrentBoard();

                    // start to move ball
                    moveBallIntervalHandler = setInterval(MoveBall, moveBallInterval);
                    setInterval(IncreaseMoveBallInterval, 60000);
                }
            }
            else {
                sock.emit('join', false);
            }
        }
    });

    // a client sends data to server
    sock.on('data', function (data) {
        if(AllClients[data.id] !== null) {
            DataReceivedFromClient(data.msg);
        }
    });
});

var moveBallInterval = 10;
var moveBallIntervalHandler;

/*
 * Functions
 */

function IncreaseMoveBallInterval() {
    moveBallInterval = (moveBallInterval * 1.3) >> 0;
    if (moveBallIntervalHandler != null) {
        clearInterval(moveBallIntervalHandler);
    }
    moveBallIntervalHandler = setInterval(MoveBall, moveBallInterval);
}

function MoveBall() {
    ball.x += Math.cos(ball.angle);
    ball.y += Math.sin(ball.angle);

    if (!ballIsOut) {

    }

    BroadcastAllClientsCurrentBoard();
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
