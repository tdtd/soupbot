'use strict';

var plugConfig = require('../plugins/config.json'); 

function Plugins(){
	this.config = plugConfig;
	this.pluginList = [];
	this.commands = [];
	this.plugins = {};
	this.commandMap = {};
}

Plugins.prototype.loadPlugins = function(){
	if (typeof this.config.plugins == 'object'){
		var plist = [],
				commands = [],
				plugins = {},
				pluginFunctions = {};
		
		//Get plugins from config file
		this.config.plugins.map(function(plugin){
			plist.push(plugin.name);
			plugins[plugin.name] = require(plugin.dir);
			if (typeof plugin.commands == 'object'){
				plugin.commands.map(function(command){
					commands.push(command);
				})
			}
		});
		
		//Create a Map of all Commands to route them to the specific plugin
		for (var plugKey in plugins){
			if(plugins.hasOwnProperty(plugKey)){
				var plug = plugins[plugKey];
				
				plugConfig.plugins.map(function(plugin){
					plugin.commands.map(function(command){
						var func = plug[command];
						if (typeof func == 'function'){	
							if (typeof pluginFunctions[command] == 'function'){
								throw 'Warning there may be more than one function that shares a name. Check your config.json file.';
							}
							pluginFunctions[command] = {command: command, plugin: plugin.name};
						}
					})
				})
				
			}
		}
		this.pluginList = plist;
		this.plugins = plugins;
		this.commands = commands;
		this.commandMap = pluginFunctions;
	}
}

Plugins.prototype.parseCommand = function(cmd, twitch, channel, user, message, fullMessage, self, mod){
	if (cmd in this.commandMap){
		var module = this.commandMap[cmd].plugin;
		if (typeof this.plugins[module][cmd] == 'function'){
			return this.plugins[module][cmd](twitch, channel, user, message, fullMessage, self, mod);
		} 
	}
}

/*
		Runs through to see if a plugin has a pluginupdater function and calls it
*/

Plugins.prototype.pluginUpdater = function(twitch, channel, user, message, self, mod, sbVar){
	for (var i = 0; i < this.pluginList.length; i++){
		var plug = this.pluginList[i];
		if(plug in this.plugins){
			if (typeof this.plugins[plug].pluginUpdater == 'function'){
				this.plugins[plug].pluginUpdater(twitch, channel, user, message, self, mod, sbVar);
			}
		}
	};
}

Plugins.prototype.isAvailable = function(cmd){
	return (cmd in this.commandMap);
}

Plugins.prototype.functionNotAvail = function(cmd, twitch, channel, user, message, fullMessage, self, mod){
	
}

var plug = new Plugins();
		plug.loadPlugins();

module.exports = plug;