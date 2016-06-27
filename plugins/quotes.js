'use strict';
var dir = getDirName(1);
var db = require('diskdb');
db = db.connect(dir +'/client/db', ['quotes']);

function getDirName(folders){
	var a = __dirname.split('\\');
	var b = a.splice(a.length-folders, folders);
	return a.join('\\');
}

/*
*		Maker and prototypes
*/
function Quote(quote){
	this.message = quote;
}

function Quotes(){};

/*
*		addquote
*		add a quote to the DB if person is a mod
*		Forward Facing: True
*/
Quotes.prototype.addquote = function(twitch, channel, user, message, fullMessage, self, mod){
	if(mod){
		var a = fullMessage.split(' ');
		var b =	a.shift();
		db.quotes.update({message: a.join(' ')}, new Quote(a.join(' ')), {multi: false, upsert: true}); 
	}
}

/*
*		quote
*		return a specific or random quote
*		Forward Facing: True
*/
Quotes.prototype.quote = function(twitch, channel, user, message, fullMessage, self, mod){
	var a = message.split(' ');
	var b = parseInt(a[1], 10);
	if (b){
		var list = db.quotes.find();
		if (b > list.length - 1){
			twitch.say(channel, "There is no quote with that index.");	
		} else {
			twitch.say(channel, list[b].message);	
		}
	} else {
		twitch.say(channel, this.getRandomQuote());
	}
}


/*
*		getRandomQuote
*		Gets a random quote from the DB
*		Forward Facing: False
*/
Quotes.prototype.getRandomQuote = function(){
	var list = db.quotes.find();
	var num = Math.floor(Math.random()*list.length);
	if (list.length === 0){
		return "No Quotes Found";
	}
	return list[num].message;
}


var quotes = new Quotes();

module.exports = quotes;