'use strict';
var db = require('diskdb');
var dir = getDirName(1);
db = db.connect(dir +'/client/db', ['soupbot', 'users']);

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
function Bet(name, stake){
	this.name = name;
	this.stake = stake;
}

function BetSystem(){
	this.currentBetQuestion = 'BET Area';
	this.mainChannels = this.init();
	this.options = [
		{text: 'Option One', betters: [], won: false},
		{text: 'Option Two', betters: [], won: false}
	];
	this.openBet = false;
	this.gamblers = [];
	this.emitter = new (require('events').EventEmitter);
}

BetSystem.prototype.init = function(){
	var a = db.soupbot.find({event:'channels'})[0];
	if (typeof a == 'object' && 'mainChannels' in a){
		return a.mainChannels;
	}
	return [];
}

/*
*		startBet
*		Announces the betting
*		Forward Facing: False
*/
BetSystem.prototype.startBet = function(twitch){
	if (this.mainChannels.length > 0){
		this.openBet = true;
		for (var i = 0, len = this.mainChannels.length; i < len; i++){
			twitch.say(this.mainChannels[i], "Bet: "+this.currentBetQuestion+" | Remember to bet using the format !bet # amount.");
			twitch.say(this.mainChannels[i], "Your options are "+this.listOptions());
		}
	}
}

/*
*		closeBet
*		Announces the close of the bet
*		Forward Facing: False
*/
BetSystem.prototype.closeBet = function(twitch){
	if (this.mainChannels.length > 0){
		this.openBet = false;
		for (var i = 0, len = this.mainChannels.length; i < len; i++){
			twitch.say(this.mainChannels[i], "Betting has now been closed. Thank you.");
		}
	}
}

/*
*		bet
*		allows users to bet.
*		Forward Facing: True
*/
BetSystem.prototype.bet = function(twitch, channel, user, message, fullMessage, self, mod){
	if (this.openBet){
		var option = message.split(" ")[1];
		var bet = message.split(" ")[2];
		if (this.gamblers.indexOf(user.username) == -1){
			if (typeof parseInt(option) == 'number'){
				if (option >= 0 && option < this.options.length && bet > 0){
					this.addBet(twitch, channel, option, user.username, bet)
				}
			} else {
				twitch.say(channel, "Please choose only 1 or 2.")
			}
		} else {
			return;
		}
	}
}

/*
*		addBet
*		checks to see if user can afford bet bet.
*		Forward Facing: True
*/
BetSystem.prototype.addBet = function(twitch, channel, option, name, bet){
	var user = db.users.find({name:name})[0];
	if (user.points - bet >= 0){
		user.points -= bet;
		db.users.update({name: name}, user, {multi: false});
		twitch.say(channel, "You have successfuly wagered "+bet+".")
	} else {
		twitch.say(channel, "You do not have enough points to make that wager.")
	}
}

/*
*		selectWinner
*		selects the winner
*		Forward Facing: False
*/
BetSystem.prototype.selectWinner = function(){
	this.openBet = false;
	for(var i = 0; i < this.options.length; i++){
		if(this.options[i].won){
			for (var j = 0, len = this.options[i].betters.length; i < len; i++){
				this.winner(this.options[i].betters[j]);
			}
		}
	}
}

/*
*		winner
*		gives winner their prize
*		Forward Facing: False
*/
BetSystem.prototype.winner = function(winner){
	var user = db.users.find({name: winner.name})[0];
	user.points += winner.wager*2;
	db.users.update({name: winner.name}, user, {multi: false});
}

/*
*		cleansePoll
*		cleanses the poll, removes all votes.
*		Forward Facing: False
*/
BetSystem.prototype.cleanseBet = function(){
	this.options.map(function(option){
		option.betters = [];
	});
	this.gamblers = [];
}

/*
*		clearBet
*		clears the current Bet
*		Forward Facing: False
*/
BetSystem.prototype.clearBet = function(){
	this.currentPollQuestion = '';
	this.options = [
		{text: 'Option One', betters: [], won: false},
		{text: 'Option Two', betters: [], won: false}
	]
	this.gamblers = [];
}

/*
*		listOptions
*		returns a string of the list options
*		Forward Facing: False
*/
BetSystem.prototype.listOptions = function(){
	var options = '';
	this.options.forEach(function(option, index){
		options += " ["+index+"] "+option.text;
	});
	return options;
}

var bet = new BetSystem();

module.exports = bet;