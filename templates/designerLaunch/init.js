var utils = require('utils');
var GA = require('./GA');
var vin65 = require('./vin65');
var oneClick = require('./oneClick');
var productLayouts = require('./productLayouts');
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
  var userInputWebsiteName = consoleRead("Enter WebsiteID, then hit enter.");
  var userInputWebsiteURL = consoleRead("Enter the Website URL, then hit enter.");
} else {
  var username = casper.cli.get(0);
  var password = casper.cli.get(1);
  var userInputWebsiteName = casper.cli.get(2);
  var userInputWebsiteURL = casper.cli.get(3);
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
vin65.initProductLayouts();
//End Product Layout Defaults

oneClick.stageComplete('#productLayoutsComplete', 'Product Layouts were initialized!');

// //Website Settings Pages Array
// var websiteSettingsPagesArray = ['/settings/index.cfm?method=websiteSettings.EditComponents',
// '/settings/index.cfm?method=websiteSettings.CopyPages',
// '/settings/index.cfm?method=websiteSettings.Ecommerce',
// '/settings/index.cfm?method=websiteSettings.CopyWineAttributes',
// '/settings/index.cfm?method=websiteSettings.CopyBlogPosts',
// '/settings/index.cfm?method=websiteSettings.CopyEventCalendars',
// '/settings/index.cfm?method=websiteSettings.CopyShipping',
// '/settings/index.cfm?method=websiteSettings.editQuickSettings'];

//Website Settings Automation
// casper.wait(1000, function() {
//   console.log(userInputWebsiteName + " was navigated to successfully");
//   this.capture('Website-Navigated-To.png');
//   this.evaluate(function() {
//     $('html').prepend('<iframe src="/settings/index.cfm?method=websiteSettings.loadSettings" class="websiteSettings"></iframe');
//     $('html').prepend('<iframe class="websiteSettingsiFrame"></iframe>');
//     $('.websiteSettingsiFrame').css('height', '200px');
//     $('.websiteSettingsiFrame').css('width', '200px');
//   });
//   this.wait(1000, function(){
//     this.evaluate(function(websiteSettingsPagesArray) {
//       var number = 0;
//       $('.websiteSettingsiFrame').attr("src", websiteSettingsPagesArray[number++]);
//     }, websiteSettingsPagesArray);
//   });
//   this.wait(1000, function(){
//     this.capture("first-window.png");
//   });
// });

casper.run();