var utils = require('utils');
var auth = require('./auth');
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

//Init Google Analytics//

casper.start('https://www.google.com/analytics', function() {
  this.click("#ga-product-links > span > a:nth-child(1)");
  this.waitForSelector('form[action="https://accounts.google.com/ServiceLoginAuth"]', function() {
    this.fill('form[action="https://accounts.google.com/ServiceLoginAuth"]', {
      'Email': auth.GAuser(),
      'Passwd': auth.GApass()
    }, true);
  });
});

casper.then(function() {
  this.wait(3000, function() {
    this.page.injectJs('jquery.js');
   var analyticsMaxName = this.evaluate(function() {
      var analyticsMaxNum = 0;
      var setMaxName = "";
      $('._GAaJ').find('._GAyB a').each(function() {
        var analyticsNum = $(this).text().replace('Web Analytics ', '');
        if(analyticsNum.length === 1) {
          analyticsNum = '0' + analyticsNum;
        }
        if(analyticsNum > analyticsMaxNum){
          console.log(analyticsNum + " is greater than " + analyticsMaxNum + " " + $(this).text());
          analyticsMaxNum = analyticsNum;
          setMaxName = $(this).text();
        }
      });
      return setMaxName;
    });
    this.wait(3000, function() {
      this.echo(analyticsMaxName);
      this.thenClick('#ID-newKennedyHeader > header > div.ID-headerWidget-tabs._GACPb > a.ID-tab-a._GAKn.ACTION-tab.TARGET-a > div > span', function() {
        this.wait(3000, function() {
          this.click('._GAgU[title="'+ analyticsMaxName +'"]'); 
          this.wait(3000, function() {
            this.waitFor(function check() {
                return this.evaluate(function() {
                    return document.querySelectorAll('#ID-m-propertyColumn-picker > div.ID-propertyPicker > div > div._GAYTb > div > div._GAdJ.ACTION-add.TARGET-').length === 1;
                });
            }, function then() {    // step to execute when check() is ok
                this.click('#ID-m-propertyColumn-picker > div.ID-propertyPicker > div > div._GAYTb > div > div._GAdJ.ACTION-add.TARGET-');
                this.wait(3000, function() {
                  this.echo("Setting up a UA-Tracking code for your website...");
                  this.click('[data-value="FOOD_AND_DRINK"]');
                  this.evaluate(function(userInputWebsiteURL) {
                    $('#ID-m-content > div > div.ID-webParams > div:nth-child(1) > div._GAAY > input').add('#ID-m-content > div > div.ID-webParams > div:nth-child(2) > div._GAAY > div > div > input').val(userInputWebsiteURL);
                    $('[data-value="FOOD_AND_DRINK"]').trigger('click');
                  }, userInputWebsiteURL);
                  this.wait(3000, function() {
                    this.click('#ID-m-content > div > div._GAFk > button._GAN._GABc._GAJe');
                  });
                });
            }, function timeout() { // step to execute if check has failed
                this.echo( analyticsMaxName + " has 50 websites. Setting up a fresh one...");
                this.click('#ID-m-accountColumn-picker > div.ID-accountPicker > div > div._GAYTb > div > div._GAdJ.ACTION-add.TARGET-');
                this.wait(3000, function() {
                  this.click('[data-value="FOOD_AND_DRINK"]');
                  this.evaluate(function(analyticsMaxName,userInputWebsiteURL) {
                    var analyticsNum = analyticsMaxName.replace('Web Analytics ', '');
                    $('[aria-label="My New Account Name"]').val("Web Analytics " + ++analyticsNum);
                    $('#ID-m-content > div > div.ID-webParams > div:nth-child(2) > div._GAAY > div > div > input').add('[aria-label="My New Website"]').val(userInputWebsiteURL);
                  }, analyticsMaxName,userInputWebsiteURL);
                  this.wait(3000, function() {
                    this.click('#ID-m-content > div > div._GAFk > button._GAN._GABc._GAJe');
                  });
                  this.wait(3000, function() {
                    this.click('body > div._GAfe > div._GAfe-_GAY > div._GATd > input.ACTION-confirmToS.TARGET-._GAy');
                  });
                });
            });
          });
          this.waitForSelector('#ID-m-content-header > div._GAgmb > div > div._GALRb', function() {
            this.wait(3000, function() {
              var googleAnalyticsUAcode = this.evaluate(function() {
                var UAcode = $('#ID-m-content-header > div._GAgmb > div > div._GALRb').text();
                return UAcode;
              });
              this.echo("Tracking Code: " + googleAnalyticsUAcode);
              this.thenOpen('https://www.vin65.com/components/clientLogin', function() {
                this.fill('#loginForm', { ClientU: username, ClientP: password }, true);
              });
              this.then(function(){
                //build list of websites available to the user
                var websitelistSelector = "select[name='WebsiteID'] option";
                var listOfWebsiteNames = this.getElementsInfo(websitelistSelector);
                 for (var i = 0; i < listOfWebsiteNames.length; i++) {
                   if(listOfWebsiteNames[i].text === userInputWebsiteName) {
                     var WebsiteID = listOfWebsiteNames[i].attributes.value;
                     console.log("An ID was grabbed for the website " + userInputWebsiteName);
                   }
                 }
                if(!WebsiteID.length) {
                  this.die("Error: Website not found.")
                }
                var WebsiteID = utils.serialize(WebsiteID);
                //Navigate to the website provided by the user
                this.evaluate(function(WebsiteID) {
                  var newID = WebsiteID.replace(/"/g, '');
                  $('a.masterlink').trigger('click');
                  $('select[name="WebsiteID"]').val(newID).change();
                  $('form[action="/index.cfm?method=login.processWebsitePicker"]').submit();
                }, WebsiteID);
              });
              //Check to see if casper navigated to the correct website IMPORTANT
              casper.waitFor(function check() {
                  return this.evaluate(function(userInputWebsiteName) {
                      return $('body > header > div > div > span.v65-title > a').text() === userInputWebsiteName + " ";
                  }, userInputWebsiteName);
              }, function then() {
                  this.echo(userInputWebsiteName + ' was navigated to successfully');
              }, function timeout() { // step to execute if check has failed
                  this.capture('Fatal-Error-#1.png').echo('Fatal Error #1: Screenshot Captured').exit();
              });
              casper.thenEvaluate(function(googleAnalyticsUAcode) {
                var regexMatch = googleAnalyticsUAcode.match(/-([^-]+)-/);
                var decodeGoogleUA = regexMatch[1];
                $('html').prepend('<iframe src="/index.cfm?method=layout.showLayout&go=%2Fsettings%2Findex%2Ecfm%3Fmethod%3Dsettings%2Eframes%26deepLink%3DwebsiteSettings" class="websiteSettings"></iframe>');
                setTimeout(function(){
                  $('.websiteSettings').contents().find('#iFramePopup').contents().find('[name="vin65AnalyticUsername"]').val("wga1@vin65analytics.com");
                  $('.websiteSettings').contents().find('#iFramePopup').contents().find('[name="vin65UACode"]').val(googleAnalyticsUAcode);
                  $('.websiteSettings').contents().find('#iFramePopup').contents().find('[name="vin65AnalyticAccount"]').val(decodeGoogleUA);
                  setTimeout(function(){
                    $('.websiteSettings').contents().find('#iFramePopup').contents().find('form[action="index.cfm?method=websiteSettings.SettingsSuccess"]').submit();
                    $('html').prepend('<div id="analyticsComplete"></div>');
                  }, 2000);
                }, 3000);
              }, googleAnalyticsUAcode);
              //End Google Analytics//

              casper.waitForSelector('#analyticsComplete', function() {
                this.echo("Google Anayltics were successfully added!");
                this.evaluate(function() {
                  window.location.reload();
                });
              });
            });
          });
        });
      });
    });
  });
});
//End Google Analytics//

var loginURL = 'https://www.vin65.com/components/clientLogin';

//Login to admin panel using user input
casper.thenOpen(loginURL, function() {
  this.fill('#loginForm', { ClientU: username, ClientP: password }, true);
});

casper.then(function(){
  //build list of websites available to the user
  var websitelistSelector = "select[name='WebsiteID'] option";
  var listOfWebsiteNames = this.getElementsInfo(websitelistSelector);
   for (var i = 0; i < listOfWebsiteNames.length; i++) {
     if(listOfWebsiteNames[i].text === userInputWebsiteName) {
       var WebsiteID = listOfWebsiteNames[i].attributes.value;
       console.log("An ID was grabbed for the website " + userInputWebsiteName);
     }
   }
  if(!WebsiteID.length) {
    this.die("Error: Website not found.")
  }
  var WebsiteID = utils.serialize(WebsiteID);
  //Navigate to the website provided by the user
  this.evaluate(function(WebsiteID) {
    var newID = WebsiteID.replace(/"/g, '');
    $('a.masterlink').trigger('click');
    $('select[name="WebsiteID"]').val(newID).change();
    $('form[action="/index.cfm?method=login.processWebsitePicker"]').submit();
  }, WebsiteID);
});

//Check to see if casper navigated to the correct website IMPORTANT
casper.waitFor(function check() {
    return this.evaluate(function(userInputWebsiteName) {
        return $('body > header > div > div > span.v65-title > a').text() === userInputWebsiteName + " ";
    }, userInputWebsiteName);
}, function then() {
    this.echo(userInputWebsiteName + ' was navigated to successfully');
}, function timeout() { // step to execute if check has failed
    this.capture('Fatal-Error-#1.png').echo('Fatal Error #1: Screenshot Captured').exit();
});

//Init Product Layout Defaults
casper.waitForSelector('#iFrameWrapper', function() {
  this.wait(3000,function(){
    this.evaluate(function() {
      $('html').prepend('<iframe src="/index.cfm?method=layout.showLayout&go=%2Fsettings%2Findex%2Ecfm%3Fmethod%3Dsettings%2Eframes%26deepLink%3DwebsiteSettings" class="websiteSettings"></iframe>');
      setTimeout(function(){
        $('html').prepend('<iframe src="/settings/index.cfm?method=websiteSettings.ProductSettings" name="websiteSettingsTwo" class="websiteSettingsTwo"></iframe>');
      },6000);
    });
  });
});
casper.then(function() {
  this.wait(8000, function(){
    this.withFrame('websiteSettingsTwo', function() {
      this.evaluate(function() {
        $("input[name='productLayouts']").prop('checked', true);
        $("input[name='listDisplayColumns']").val("ProductTitle");
        $("select[name='drilldownDisplay']").val("Custom");
        $('form[action="index.cfm?method=websiteSettings.ProductSettingsSuccess"]').submit();
      });
    });
    this.evaluate(function() {
      $('html').prepend('<div id="productLayoutsComplete"></div>');
    });
  });
});
//End Product Layout Defaults

casper.waitForSelector('#productLayoutsComplete', function() {
  this.echo("Product Layouts were initialized!");
  this.evaluate(function() {
    window.location.reload();
  });
});

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