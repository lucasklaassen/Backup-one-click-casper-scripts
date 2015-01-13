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
// vin65.initProductLayouts();
//End Product Layout Defaults

// //Website Settings Pages Array
var websiteSettingsPagesArray = ['/settings/index.cfm?method=websiteSettings.EditComponents',
'/settings/index.cfm?method=websiteSettings.CopyPages',
'/settings/index.cfm?method=websiteSettings.Ecommerce',
'/settings/index.cfm?method=websiteSettings.CopyWineAttributes',
'/settings/index.cfm?method=websiteSettings.CopyBlogPosts',
'/settings/index.cfm?method=websiteSettings.CopyEventCalendars',
'/settings/index.cfm?method=websiteSettings.CopyShipping',
'/settings/index.cfm?method=websiteSettings.editQuickSettings'];

// //Website Settings Automation
casper.wait(1000, function() {
    this.evaluate(function() {
      $('html').prepend('<iframe src="/settings/index.cfm?method=websiteSettings.loadSettings" name="websiteSettings" class="websiteSettings"></iframe');
      $('html').prepend('<iframe name="websiteSettingsFunctions" class="websiteSettingsFunctions"></iframe>');
      $('.websiteSettingsFunctions').css('height', '200px');
      $('.websiteSettingsFunctions').css('width', '200px');
    });
  this.wait(1000, function(){
    this.evaluate(function(websiteSettingsPagesArray) {
      $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[0]);
    }, websiteSettingsPagesArray);
  });
  this.wait(1000, function(){
    this.evaluate(function() {
      $('.websiteSettingsFunctions').contents().find('input').prop('checked', true);
    });
    this.wait(1000, function() {
      this.withFrame('websiteSettingsFunctions', function() {
        this.click('#popupFooterRight > a > img');
      });
    });
  });
  this.wait(4000, function() {
    this.evaluate(function(websiteSettingsPagesArray) {
      $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[1]);
    }, websiteSettingsPagesArray);
  });
  this.wait(1000, function(){
    var copyPages = this.evaluate(function() {
      var copyPagesBoolean;
      var setWebsiteID = function(id) {
        $('.websiteSettingsFunctions').contents().find("select[name='fromWebsiteID']").val(id);
      }
      $('.websiteSettingsFunctions').contents().find("select[name='fromWebsiteID']").find('option').each(function(){
        if($(this).text() === "Vin65 Designer Launch Template"){
          setWebsiteID($(this).val());
          copyPagesBoolean = true;
          return false;
        } else if($(this).text() === "Vin65Cloud2 Pages Template") {
          setWebsiteID($(this).val());
          copyPagesBoolean = true;
          return false;
        } else if($(this).text() === "Vin65cloud3 Pages Template") {
          setWebsiteID($(this).val());
          copyPagesBoolean = true;
          return false;
        } else if($(this).text() === "Vin65Cloud4 Pages Template") {
          setWebsiteID($(this).val());
          copyPagesBoolean = true;
          return false;
        } else if($(this).text() === "Vin65 Australia Template 1") {
          setWebsiteID($(this).val());
          copyPagesBoolean = true;
          return false;
        } else if($(this).text() === "IBG Pages Template") {
          setWebsiteID($(this).val());
          copyPagesBoolean = true;
          return false;
        } else {
          copyPagesBoolean = false;
        }
      });
      return copyPagesBoolean;
    });
    this.wait(2000, function() {
      if(copyPages === false) {
        this.echo("There are no websites to copy pages from. :( ").exit();
      }
    });
    this.wait(1000, function() {
      this.withFrame('websiteSettingsFunctions', function() {
        this.click('#popupFooterRight > a > img');
      });
    });
    this.wait(4000, function() {
      this.evaluate(function(websiteSettingsPagesArray) {
        $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[2]);
      }, websiteSettingsPagesArray);
    });
  });
});

casper.run();