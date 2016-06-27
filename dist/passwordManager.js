'use strict';

var CryptoJS = require("crypto-js");
var conf = require('../plugins/config.json');
var AESE = CryptoJS.AES.encrypt;
var AESD = CryptoJS.AES.decrypt;


function pwM (){
	var a = JSON.stringify(conf).substr(1,20);
	
	this.encryptText = function(pass){
		return AESE(pass, a);
	}
	
	this.decryptText = function(pass){
		if (typeof pass != 'string'){
			pass = pass.toString();
		}
		return AESD(pass, a).toString(CryptoJS.enc.Utf8);
	}
}

module.exports = new pwM();