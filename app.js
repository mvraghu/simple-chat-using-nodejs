var express= require('express');
var app= express();
var http=require('http');
var server=http.createServer(app);
var io =require('socket.io').listen(server);
var redis = require('redis');
var redisClient = redis.createClient();
var messages = [];

app.get('/', function(req,res) {
  res.sendfile('view/chat.html');
});

io.sockets.on('connection' ,function (client)
{

	client.on("messages" , function (msg)
	{
		client.get('name', function(err,name){

			console.log(name + ":" + msg);
			storeMessage(name,msg);
			client.broadcast.emit("messages",name + ":" + msg);
		});

	});

	client.on("join" , function (name)
	{

		client.set("name" , name);

		  redisClient.lrange("messages", 0, -1, function(err, messages){
		  	messages = messages.reverse();

		  messages.forEach(function(message) {
		 	message = JSON.parse(message);
		  	client.emit("messages", message.name + ": " + message.data);

		  	});



		});
		


	});
});



var storeMessage = function(name, data){
var message = JSON.stringify({name: name, data: data}); 
 redisClient.lpush("messages", message, function(err, response) {
   redisClient.ltrim("messages", 0, 10);
});

};

server.listen(8080);