'Use Strict';

var Promise = require("bluebird");
var request = require('request');


function TwitchHandler(){
	this.currentUsersInChat = 0;
};

TwitchHandler.prototype.getUsers = function(channel){
	var that = this;
	if (channel.charAt(0) == '#'){
		channel = channel.substr(1);
	}
	var url = 'https://tmi.twitch.tv/group/user/'+channel+'/chatters';
	return new Promise(function(resolve, reject){
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var bod = JSON.parse(body)
				that.currentUsersInChat = bod["chatter_count"] - 1;
				return resolve(bod);
			} else {
				return reject(error);
			}
		});
	});
};

TwitchHandler.prototype.getStreamInfo = function(channel){
	var that = this;
	if (channel.charAt(0) == '#'){
		channel = channel.substr(1);
	}
	var url = 'https://api.twitch.tv/kraken/streams/'+channel;
	return new Promise(function(resolve, reject){
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var bod = JSON.parse(body)
				return resolve(bod);
			} else {
				return reject(error);
			}
		});
	});
};

var twi = new TwitchHandler();
module.exports = twi;