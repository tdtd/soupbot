'use strict';
var twi = require('../dist/twitchHandler.js');
var dir = getDirName(1);
var db = require('diskdb');
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
*	Get Info from diskdb
*/
function addUserToDB(uname){
	var a = db.users.find({name: uname})[0];
	if (typeof a != 'object' || !'name' in a){
		var user = new User(uname, 0, 0);
		db.users.update({name: uname}, user, {multi: false, upsert: true});
	}
}

/*
*		Maker and prototypes
*/

function User (name, points, exalted){
	this.name = name;
	this.points = points;
	this.exalted = exalted;
	this.goldStatus = false;
};

function UserSystem(){
	var pointsPerTick = 10;
	var tickRate = 3; // In Minutes
	
	this.activeUsers = [];
	this.usersInChat = [];
	
	this.recentMessage = Date.now();
	this.messageCount = 0;
	
	function minTick(){
		return tickRate * 60000;
	}
	
	var pointTick = function(that){
		if (that.ifRecentMessage()){
			that.awardPoints(pointsPerTick);
		}
		setTimeout(pointTick, minTick(), that);
	};
	
	var userTick = function(that){
		if (that.ifRecentMessage()){
			that.parseUsers();
		}
		setTimeout(userTick, 30000, that);
	};
	
	pointTick(this);
	userTick(this);
}
/*
*		parseUsers
*		Get List of chatters from server, check if they are in DB then add them.
*		Forward Facing: False
*/
UserSystem.prototype.parseUsers = function(){
	var that = this;
	if(this.ifRecentMessage()){
		var chans = db.soupbot.find({event:'channels'})[0];
		if (typeof chans != 'object'){
			return;
		}
		var channels = chans.allChannels;
		channels.map(function(chan){
			twi.getUsers(chan).then(
				function(res){
					that.addUsersToDB(res);
				}, 
				function(err){
				});
		})
	}
}

/*
*		addUsersToDB
*		Parse through list of users from twitch to pass to DB
*		Forward Facing: False
*/
UserSystem.prototype.addUsersToDB = function(twObj){
	var allChatters = [];
	if ('chatters' in twObj){
		Object.keys(twObj.chatters).map(function(key){
			twObj.chatters[key].map(function(user){
				addUserToDB(user);
				if (allChatters.indexOf(user) == -1){
					allChatters.push(user);
				}
			})
		})
	}
	this.usersInChat = allChatters;
}

/*
*		pluginUpdater
*		Parse messages from the pluginHandler that do not have a command in them. to keep track of messages
*		Forward Facing: False
*/
UserSystem.prototype.pluginUpdater = function(twitch, channel, user, message, self, mod, sbVar){
	var chan = channel.substr(1);
	this.recentMessage = Date.now();
	this.parseActive(user.username);
}

/*
*		parseActive
*		Checks to see if user is in the activeUsers array, if not adds them
*		Forward Facing: False
*/
UserSystem.prototype.parseActive = function(user){
	if (this.activeUsers.indexOf(user.username) == -1){
		this.activeUsers.push(user.username);
	}
}

/*
*		clearActive
*		Removes all users from the activeUsers Array (For Active PointSystem)
*		Forward Facing: False
*/
UserSystem.prototype.clearActive = function(){
	this.activeUsers = [];
}

/*
*		awardPoints
*		Removes all users from the activeUsers Array (For Active PointSystem)
*		Forward Facing: False
*/
UserSystem.prototype.awardPoints = function(points){
	var that = this;
	this.usersInChat.map(function(username){
		if (that.activeUsers == username){
			that.giveUserPoints(username, points+(points*.1));
		} else {
			that.giveUserPoints(username, points);
		}
	})
	this.clearActive();
}

/*
*		removeUserPoints
*		Retrieves user from DB, gives them points and updates
*		Forward Facing: False
*/

UserSystem.prototype.removeUserPoints = function(username, points){
	var user = db.users.find({name: username})[0];
	if (user.points - points < 0){
		return false;
	} else {
		user.points -= points;
		db.users.update({name: username}, user, {multi: none, upsert: true});
	}
	return points;
}

/*
*		giveUserPoints
*		Gives a User a certain amount of points
*		Forward Facing: False
*/
UserSystem.prototype.giveUserPoints = function(username, points){
	var user = db.users.find({name: username})[0];
	if (typeof user == 'object'){
		user.points += points;
	} else {
		var user = new User(username, points, 0);
	}
	db.users.update({name:username}, user, {multi: false, upsert: true})
}

/*
*		points
*		Tells a user how many points they currently have
*		Forward Facing: True
*/
UserSystem.prototype.points = function(twitch, channel, user, message, self, mod){
	var userDB = db.users.find({name: user.username})[0];
	
	if (typeof userDB == 'object'){
		if ("points" in userDB){
			twitch.say(channel, user.username+', you currently have '+ userDB.points +' in your account');
		} else {
			twitch.say(channel, 'I am sorry, '+user.username+', I cannot currently find your account.');
		}
	}
}

/*
*		retrieveUsers
*		Get users from tmi
*		Forward Facing: Fakse
*/
UserSystem.prototype.retrieveUsers = function(channel){
	twi.getUsers(channel);
}

/*
*		ifRecentMessage
*		Get users from tmi
*		Forward Facing: False
*/
UserSystem.prototype.ifRecentMessage = function(){
	var a = Date.now();
	if(a - this.recentMessage < 300000){
		return true;
	}
	return false;
}

var uSys = new UserSystem();

module.exports = uSys;