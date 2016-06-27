'use strict';

var help = {};

help.help = function (twitch, channel, user, message, self, mod){
	var commands = ['!submit', ' !queue', ' !currentLevel', ' !nemesis', ' !soupmate',' !soulmate', ' !mypoints', ' !heist', ' !quote', ' !mixquote'];
	twitch.say(channel, "The available commands are: " + commands + ".");
}

module.exports = help;