var utils = require('utils');
var GA = require('./GA');
var vin65 = require('./vin65');
var vin65Plus = require('./vin65Plus');
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
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/35 Mozilla/5.0'
  }
});

var consoleRead = function(userMessage) {
  var system = require('system');
  system.stdout.writeLine(userMessage);
  var line = system.stdin.readLine();
  return line;
};

//If username and password were not passed in as arg's ask for them now
if(casper.cli.args.length < 8 ) {
  casper.echo("ERROR: Please ensure all fields have been filled out.").exit();
} else {
  var username = casper.cli.get(0);
  var password = casper.cli.get(1);
  var userInputWebsiteName = casper.cli.get(2);
  var userInputWebsiteURL = casper.cli.get(3);
  var userInputWebsiteCity = casper.cli.get(4);
  var userInputWebsiteState = casper.cli.get(5);
  var userInputWebsiteCountry = casper.cli.get(6);
  var vin65plus = casper.cli.get(7);
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
// vin65.websiteToCopyFrom();
//End Website Settings Functions

//Init Resource Bundle Defaults//
// vin65.initResourceBundle();
//End Resource Bundle Defaults//

//Init Parse Custom Drilldown//
vin65.initParseCustomDrilldown();
//End Parse Custom Drilldown//

//Init Vin65Plus Setup//
// if(vin65plus) {
//   vin65Plus.initTwilio();
// }
//End Vin65Plus Setup//

casper.run();
