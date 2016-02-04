
var express = require("express");
var path = require("path");
var app = express();

app.set('views',path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// app.use(express.static(__dirname+ "/static"));

app.get('/', function(req, res) {
	res.render("index");
});

var server = app.listen(8000, function() {
	console.log("listening on port 8000");
});

var io = require('socket.io').listen(server);
var users = {};
var history=[];

io.sockets.on('connection', function(socket) {

	socket.on("requestName", function(data) {
		var name= data.name.trim();
		var date = new Date();
        var time = date.toLocaleTimeString();
		console.log('Client requested name: ' + name);
		if (!name) {
			socket.emit('errorNoName',{error:'Please enter valid nickname'})
		}
		else {
			users[socket.id] = name; 
			var message =  time + " "  + name + " " +'has entered the chat';
			io.emit('serverMsg', {msg: message});
			io.emit('chatHistory',{history:history});
			history.push(message);
		}
	});

	socket.on('requestChat', function(data) {
		// console.log(data.msg);
		var date = new Date();
        var time = date.toLocaleTimeString();
		var message = time + " " + users[socket.id] + " : " + data.msg;
		history.push(message);
		io.emit('serverMsg', {msg:message});
	})


	socket.on("disconnect", function(data){
		var message = users[socket.id] + ' has left the chat!';
		history.push(message);
		io.emit("serverMsg", {msg: message});
		delete users[socket.id];
		console.log(users);
	})
});