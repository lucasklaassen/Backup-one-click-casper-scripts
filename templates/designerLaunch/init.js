var utils = require('utils');
var GA = require('./GA');
var vin65 = require('./vin65');
var oneClick = require('./oneClick');
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  waitTimeout: 25000,
  viewportSize: {
    width: 1000, height: 2000
  },
  pageSettings: {
    loadImages: true,
    loadPlugins: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/29.0.1547.2 Mozilla/5.0'
  }
});

var consoleRead = function(userMessage) {
  var system = require('system');
  system.stdout.writeLine(userMessage);
  var line = system.stdin.readLine();
  return line;
}

//If username and password were not passed in as arg's ask for them now
if(casper.cli.args.length < 4) {
  var username = consoleRead("Enter username, then hit enter.");
  var password = consoleRead("Enter password, then hit enter.");
  var userInputWebsiteName = consoleRead("Enter Website Name, then hit enter.");
  var userInputWebsiteURL = consoleRead("Enter the Website URL, then hit enter.");
  var userInputWebsiteLocation = consoleRead("Enter the winery's location, then hit enter.");
} else {
  var username = casper.cli.get(0);
  var password = casper.cli.get(1);
  var userInputWebsiteName = casper.cli.get(2);
  var userInputWebsiteURL = casper.cli.get(3);
  var userInputWebsiteLocation = casper.cli.get(4);
}

casper.start();

//Init Google Analytics//
// GA.login();
// GA.initUATrackingCode();
//End Google Analytics//

vin65.login();
vin65.grabWebsiteID();
vin65.validateWebsiteID();

//Init Product Layout Defaults
// vin65.initProductLayouts();
//End Product Layout Defaults

//Init Website Settings Functions
vin65.websiteSettingsFunctions();
//End Website Settings Functions

casper.run();