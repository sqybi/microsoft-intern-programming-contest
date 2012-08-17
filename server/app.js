var http = require('http');
var express = require('express');
var app = express();
app.get('/', function(rq, rs) {
	rs.redirect('/index.html');
});
app.get('/:file', function(rq, rs) {
	rs.sendfile(rq.params.file);
});

var server = http.createServer(app).listen(8080);

/*
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(sock) {
	sock.on('data', function(data) {
		sock.emit('data', data);
	});
});

console.log("You can start the game by going to 127.0.0.1:8080, if you want to join the game with another pc go to <pc name or ip of server pc>:8080");
*/

var io = require('socket.io').listen(server); 
io.sockets.on('connection', function (sock) { 
	sock.on('data', function (data) {
		DataReceivedFromClient(data); 
		if(AllClients[data.id] == null)
			AllClients[data.id] = sock;
		BroadCastAllClients(data); 
	});
	sock.on('join', function (data) {
		if(AllClients[data.id] == null)
			AllClients[data.id] = sock;
	});
}); 
console.log("You can start the game by going to 127.0.0.1:8080, if you want to join the game with another pc go to <pc name or ip of server pc>:8080"); 

var AllClients = new Object(); 

function DataReceivedFromClient(data) { 
	console.log(data);
}

function BroadCastAllClients(data) { 
	for (client in AllClients) {
		if (AllClients[client]) {
			AllClients[client].emit('data', data.msg); 
		}
	} 
}