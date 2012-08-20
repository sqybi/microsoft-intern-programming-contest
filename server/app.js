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
io.sockets.on('connection', function (sock) {

    // a new client joins
    sock.on('join', function (data) {
        if(AllClients[data.id] == null) {
            AllClients[data.id] = sock;
            sock.emit('joined', null);
        }
    });

    // a client sends data to server
    sock.on('data', function (data) {
        if(AllClients[data.id] !== null) {
            DataReceivedFromClient(data.msg);
        }
        //BroadCastAllClients(data);
    });
});

function MoveBall() {

}

function DataReceivedFromClient(data) {
    console.log(data);
}

function BroadCastAllClients(data) {
    for (client in AllClients) {
        if (AllClients[client]) {
            AllClients[client].emit('data', data);
        }
    }
}
