'use strict';
var db = require('diskdb');
var dir = getDirName(1);
db = db.connect(dir +'/client/db', ['users']);

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
function GuessSystem(){
	this.activeGuess = false;
	this.currentNumber = 0;
	this.prize = 500;
	this.guessers = {};
	this.winner = '';
	this.mainChannels = this.init();
	this.emitter = new (require('events').EventEmitter);
}

GuessSystem.prototype.init = function(){
	var a = db.soupbot.find({event:'channels'})[0];
	if (typeof a == 'object' && 'mainChannels' in a){
		return a.mainChannels;
	}
	return [];
}

/*
*		startGuessing
*		Announces the betting
*		Forward Facing: False
*/
GuessSystem.prototype.startGuessing = function(twitch){
	this.activeGuess = true;
	if (this.mainChannels.length > 0){
		this.openBet = true;
		for (var i = 0, len = this.mainChannels.length; i < len; i++){
			twitch.say(this.mainChannels[i], "Guess the number | Remember to use the format !guess #.");
		}
	}
}

/*
*		endGuessing
*		ends guessing and sees if there is a winner.
*		Forward Facing: False
*/
GuessSystem.prototype.endGuessing = function(twitch, channel){
	this.activeGuess = false;
	if(this.winner){
		var user = db.users.find({name: this.winner})[0];
		if(typeof user == 'object'){
			user.points += this.prize;
			db.users.update({name: user.name}, user, {multi: false});
			twitch.say(channel, this.winner+", a winner is you! http://i.imgur.com/KL8qTEz.jpg");
		}
	} else {
		twitch.say(channel, "There was no winner!")
	}
	this.clearGuessing();
}

/*
*		clearGuessing
*		clears back to normal
*		Forward Facing: False
*/
GuessSystem.prototype.clearGuessing = function(){
	this.currentNumber = 0;
	this.guesser = {};
	this.winner = '';
}

/*
*		randomGuess
*		generates a random number
*		Forward Facing: False
*/
GuessSystem.prototype.randomChoice = function(){
	var ran = Math.floor(Math.random()*100)+1;
	this.currentNumber = ran;
}

/*
*		guess
*		Input from twitch holding guess
*		Forward Facing: True
*/
GuessSystem.prototype.guess = function(twitch, channel, user, message, fullMessage, self, mod){
	if (!this.activeGuess){
		twitch.say(channel, "There is no active guessing game.")
		return;
	}
	var option = message.split(' ')[1];
	option = parseInt(option);
	console.log(option)
	console.log(this.currentNumber)
	if (user.username in this.guessers){
		if (this.guessers[user.username].guesses < 5){
			this.guessers[user.username].guesses++;

			if (option == this.currentNumber){
				this.winner = user.username;
				this.endGuessing(twitch, channel);
			}
		} else {
			twitch.say(channel, "You have hit your guess limit");	
		}
	} else {
		this.guessers[user.username] = {};
		this.guessers[user.username].guesses = 1;
			
		if (option == this.currentNumber){
			this.winner = user.username;
			this.endGuessing(twitch, channel);
		}
	}
}



var guess = new GuessSystem();

module.exports = guess;