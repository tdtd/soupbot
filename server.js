var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var port = process.env.PORT || 3500;
var irc = require('tmi.js');
var soupbot = require('./dist/soupBot.js');
var twitch;
var options = {
	options: {
		//debug: true
	},
	connection: {
		//cluster: "aws",
		reconnect: true
	},
	identity: {
		username: '',
		password: '' //oauthtoken use http://twitchapps.com/tmi/
	},
	channels: [""]
};

server.listen(port, function(){
  console.log("Listening on "+port);
})

app.use(express.static(path.resolve(__dirname, 'client')));

twitch = new irc.client(options);
twitch.connect();

twitch.on("chat", function (channel, user, message, self) {
	soupbot.parseMessage(twitch, channel, user, message, self);
});