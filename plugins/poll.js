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
function Option(text){
	this.text = text;
	this.votes = 0;
}

function PollSystem(){
	this.currentPollQuestion = '';
	this.mainChannels = this.init();
	this.options = [];
	this.voted = [];
	this.emitter = new (require('events').EventEmitter);
}

PollSystem.prototype.init = function(){
	var a = db.soupbot.find({event:'channels'})[0];
	if (typeof a == 'object' && 'mainChannels' in a){
		return a.mainChannels;
	}
	return [];
}

/*
*		startPoll
*		Announces the Poll
*		Forward Facing: False
*/
PollSystem.prototype.startPoll = function(twitch){
	if (this.mainChannels.length > 0){
		for (var i = 0, len = this.mainChannels.length; i < len; i++){
			twitch.say(this.mainChannels[i], "POLL: "+this.currentPollQuestion+" | Remember to vote using the format !vote #");
			twitch.say(this.mainChannels[i], "Your options are "+this.listOptions());
		}
	}
}

/*
*		addOption
*		adds an option to the poll
*		Forward Facing: False
*/
PollSystem.prototype.addOption = function(){
	this.options.push(new Option(''));
}

/*
*		vote
*		allows users to vote.
*		Forward Facing: True
*/
PollSystem.prototype.vote = function(twitch, channel, user, message, fullMessage, self, mod){
	var option = message.split(" ")[1];
	if (this.voted.indexOf(user.username) == -1){
		if (typeof parseInt(option) == 'number'){
			if (option >= 0 && option < this.options.length){
				this.options[option].votes++;
				this.voted.push(user.username);
			}
		} else {
			twitch.say(channel, "Please only vote using the number assigned to the option you would like.")
		}
	} else {
		return;
	}
}

/*
*		removeOption
*		removes an option from the poll
*		Forward Facing: False
*/
PollSystem.prototype.removeOption = function(index){
	var a = this.options.splice(index, 1)[0];
}

/*
*		cleansePoll
*		cleanses the poll, removes all votes.
*		Forward Facing: False
*/
PollSystem.prototype.cleansePoll = function(){
	this.options.map(function(option){
		option.votes = 0;
	});
	this.voted = [];
}

/*
*		clearPoll
*		clears the current poll
*		Forward Facing: False
*/
PollSystem.prototype.clearPoll = function(){
	this.currentPollQuestion = '';
	this.options = [];
	this.voted = [];
}

/*
*		listOptions
*		returns a string of the list options
*		Forward Facing: False
*/
PollSystem.prototype.listOptions = function(){
	var options = '';
	this.options.forEach(function(option, index){
		options += " ["+index+"] "+option.text;
	});
	return options;
}

var poll = new PollSystem();

module.exports = poll;