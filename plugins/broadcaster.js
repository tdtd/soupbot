'use strict';
var db = require('diskdb');
var dir = getDirName(1);
db = db.connect(dir +'/client/db', ['soupbot']);

function getDirName(folders){
	var a = __dirname.split('\\');
	var b = a.splice(a.length-folders, folders);
	return a.join('\\');
}
/*
*		Regular Functions
*/

/*
*		Maker and prototypes
*/
function BroadcastSystem(){
	this.totMessages = 5;
	this.twitch;
	this.broadcastMessages = [];
	this.mainChannels = this.init();
	this.emitter = new (require('events').EventEmitter);
	
	var load = function(that){
		var a = db.soupbot.find({event:"broadcastMessages"})[0];
		if (typeof a == 'object'){
			if (a.messages.length > 0){
				that.broadcastMessages = a.messages;
			}
		}
	}
	
	var broadcastTimer = function(that){
		that.broadcastRandom();
		setTimeout(broadcastTimer, 30000, that);
	};
	
	load(this);
	broadcastTimer(this);
}

BroadcastSystem.prototype.init = function(){
	var a = db.soupbot.find({event:'channels'})[0];
	if (typeof a == 'object' && 'mainChannels' in a){
		return a.mainChannels;
	}
	return [];
}

/*
*		broadcastRandom
*		Announces the betting
*		Forward Facing: False
*/
BroadcastSystem.prototype.broadcastRandom = function(){
	if (this.totMessages < 5){
		return;
	}
	if (typeof this.twitch == 'object'){
		if (this.broadcastMessages.length > 0){
			this.totMessages = 0;
			for (var i = 0, len = this.mainChannels.length; i < len; i++){
				var ran = Math.floor(Math.random()*this.broadcastMessages.length);
				this.twitch.say(this.mainChannels[i], this.broadcastMessages[ran]);
			}
		}
	}
}

/*
*		addMessage
*		adds a message to the announce pool
*		Forward Facing: False
*/
BroadcastSystem.prototype.addMessage = function(){
	this.broadcastMessages.push("New broadcast message.");
	this.saveMessages();
}

/*
*		removeMessage
*		adds a message to the announce pool
*		Forward Facing: False
*/
BroadcastSystem.prototype.removeMessage = function(index){
	this.broadcastMessages.splice(index, 1);
	this.saveMessages();
}

/*
*		saveMessages
*		save messages to db
*		Forward Facing: False
*/
BroadcastSystem.prototype.saveMessages = function(){
	db.soupbot.update({event:"broadcastMessages"}, {event: "broadcastMessages", messages: this.broadcastMessages}, {multi: false, upsert:true});
}

/*
*		pluginUpdater
*		Parse messages from the pluginHandler that do not have a command in them. to keep track of messages
*		Forward Facing: False
*/
BroadcastSystem.prototype.pluginUpdater = function(twitch, channel, user, message, self, mod, sbVar){
	this.totMessages++;
	this.twitch = twitch;
}


var broad = new BroadcastSystem();

module.exports = broad;