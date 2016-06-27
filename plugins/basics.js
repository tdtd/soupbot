'use strict';
var twi = require('../dist/twitchHandler.js');

/*
*		Maker and prototypes
*/
function Basics(){};

/*
*		soupmate
*		returns users soupmate
*		Forward Facing: False
*/
Basics.prototype.soupmate = function(twitch, channel, user, message, fullMessage, self, mod){
	var list = 'Chili,Beef & Barley,Chinese Mushroom,Beer & Cheddar,Potato Bacon,Belgian Leek,Chicken Almond,Arizona Mountain,Bayou Shrimp,Beef & Pasta Mushroom,Georgia Peanut,Bacon Cheddar,Cream of Potato,Butternut Bisque,Chicken Barley,Bean & Bacon,Charleston Style Shrimp Curry,Cabbage Beef Stew,Hearty Vegetable,Canadian Cheddar,German Potato,Cabbage Kielbasa,Chicken Broccoli Cheddar,Beaf & Bean,Clamboyance,German Beer Stew,Hot Madreline,Cheddar Vegetable,Irish Potato,Carrot Cream,Chicken Chowder,Black Bean,Dilled Salmon,German Pork Goulash,Mediterranean Mushroom,Cheeseburger Macaroni,Potato Cheddar,Cream of Asparagus,Chicken Curry,Beefy Black Eye,Filet O’Fish Chowder,Guadalajara,Minestrone,Onion Cheddar,Potato Corn Chowder,Cream of Broccoli,Chicken Gumbo,Shaker Bean Chowder,Fish Mornay,Hungarian Goulash,Mushroom Cheddar,Pasta Cheddar,Potato Dill,Cream of Cauliflower,Chicken Medley,Cajun Red Bean,Pasta & Clam,Peruvian Shrimp Chowder,Hunter’s Stew,Mushroom Gratinee,Spice & Cheddar,Potato Leek,French Onion,Chicken Mushroom,Country Inn Lentil,Pirates’ Stew,Inflation Vegetable,Sherried Tomato,Redskin Potato,Fresh Pea,Chicken Noodle,German Lentil,Savannah Fish Stew,Italian Sausage,Tomato Barley,Potato Sausage,Gratin Savoyard,Chicken Rice,Dallas Cowboy Bean,Seashore Chowder,Little Italy,Tomato Cheddar,Mexican Potato,Lemon Garden,Chicken Tortilla,French Cassoulet,Shrimp & Cheddar,Off Yur Noodle,Tomato Rice,Newport Potato,Oriental Broccoli,Chicken Vegetable,French Market,Shrimp & Pasta,Pioneer Stew,Tomato Noodle,Potato Mushroom,Pork Oriental,Cockaleekie,Pinto Bean ‘N Ham,Shrimp Bisque,Texas Beef Stew,Wild Rice,Royal Ascot,Country Captain,Smokey & The Bean,Shrimp Creole,The Spice is Right,Burgundy Mushroom,Louisiana Rice,Lotus,U.S. Senate Bean,Shrimp Gumbo,Vegetable Beef,Country Cabbage,Mexican Chicken,Split Pea With Ham,Shrimp Newburg,Soup for The Slopes,Vegetable Provencial,Mullligatawney,Some Like It Hot,Shrimp Rotelle,Red Eye Stew,Brunswick Stew,Snow Crab,Country Style Beef Stew';
	var soupList = list.split(',');
	var soup = soupList[Math.floor(Math.random()*soupList.length)];
	twitch.say(channel, user.username+" your soupmate is "+soup);
}

/*
*		uptime
*		returns stream uptime
*		Forward Facing: true
*/
Basics.prototype.uptime = function(twitch, channel, user, message, fullMessage, self, mod){
	twi.getStreamInfo(channel).then(function(res){
		if (res.stream){
			var a = new Date(res.stream.created_at);
			var b = new Date();
			var c = secToHMS(Math.floor((b-a)/1000));
			var timeSent = '';
			if (c.hours){
				timeSent += c.hours+" hours, ";
			}
			
			if (c.hours && !c.minutes){
				timeSent += c.minutes+" minutes, and ";
			}
			
			if (c.minutes){
				timeSent += c.minutes+" minutes and ";
			}
			
			timeSent += c.seconds+" seconds.";
			
			twitch.say(channel, "The stream has been running for "+timeSent)
		} else {
			twitch.say(channel, "There is no active stream.")
		}
	})
	//twitch.say(channel, user.username+" your soupmate is "+soup);
}

Basics.prototype.whoareyou = function(twitch, channel, user, message, fullMessage, self, mod){
	twitch.say(channel, 'I am Soupbot.')
}

var basics = new Basics();

module.exports = basics;



/*
*
*/
function secToHMS(sec) {
	var seconds = Math.floor(sec % 60),
	    totalMinutes = Math.floor(sec / 60),
	    minutes = totalMinutes % 60,
	    hours = Math.floor(totalMinutes / 60);

	if (minutes < 10) {
		if (minutes <= 0) {
			minutes = 0;
		}
		minutes = '0' + minutes;
	}

	if (seconds < 10) {
		if (seconds <= 0) {
			seconds = 0;
		}
		seconds = '0' + seconds;
	}

	if (hours <= 0) {
		hours = 0;
	}

	return {
		hours: hours,
		minutes: minutes,
		seconds: seconds
	};
};