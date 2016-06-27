'use strict';

var ph = require('./pluginHelper.js');

function SoupBot(){
	this.emitter = new (require('events').EventEmitter);
	this.lastMessage;
	this.messageCounter = 0;
}

/*
*		House Cleaning
*/
function checkMod(channel, user){
	return (user["user-type"] === "mod" || user.username === channel.replace("#", ""));
}

function addToRecent(user){
	if (recentlyActive.indexOf(user.username) == -1){
		recentlyActive.push(user.username);
	}
}


/*
*
*		Basic Functions
*
*/
SoupBot.prototype.parseMessage = function(twitch, channel, user, message, self) {
	var commandRegex = /^\!([^\s]+)/;
	var command = '';

	var fullMessage = message;
	message = message.toLowerCase();
	user.username = user.username.toLowerCase();
	if (commandRegex.test(message)){
		command = message.match(commandRegex)[1];
	}
	// Helpful for delaying messages
	this.messageCounter++;
	
	if (ph.isAvailable(command)){
		ph.parseCommand(command, twitch, channel, user, message, fullMessage, self, checkMod(channel, user));
	} else {
		ph.functionNotAvail(command, twitch, channel, user, message, fullMessage, self, checkMod(channel, user));
	}
	
	ph.pluginUpdater(twitch, channel, user, message, self, checkMod(channel, user), {lastMessage: this.lastMessage, messageCounter: this.messageCounter});
	// Helpful for delaying messages
	this.lastMessage = Date.now();
}

SoupBot.prototype.recentMessage = function(){
	var a = Date.now();
	if (a - this.lastMessage < 30000){
		return false;
	}
	return true;
}

var sb = new SoupBot();

module.exports = sb;