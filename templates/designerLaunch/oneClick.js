//One Click Functions
var require = patchRequire(require);
var utils = require('utils');
var auth = require('./auth');

exports.stageComplete = function(selector, message) {
	casper.waitForSelector(selector, function() {
	  this.echo(message);
	  this.evaluate(function() {
	    window.location.reload();
	  });
	});
}