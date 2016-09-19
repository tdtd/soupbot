# soupbot
An easy to use lightweight version of soupBot for plugin development.

#What is SoupBot?
SoupBot is an easy to use twitchbot which supports custom plugins. This is the development branch that requires a [node.js](https://nodejs.org) installation.
Plugin development works like creating a node.js module. Save the file in the plugins directory and add the plugin to plugins/config.json and SoupBot will render the rest.

#Getting Started
To get started, change the options variable in server.js. Place your username in options.identity.username and oAuth token in options.identity.password. oAuth tokens for twitch are available at http://twitchapps.com/tmi/.
