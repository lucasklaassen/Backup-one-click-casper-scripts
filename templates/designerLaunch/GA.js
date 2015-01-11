//Google Analytics Setup
var require = patchRequire(require);
var utils = require('utils');
var auth = require('./auth');
var vin65 = require('./vin65');
var oneClick = require('./oneClick');

exports.login = function() {
	casper.thenOpen('https://www.google.com/analytics', function() {
	  this.click("#ga-product-links > span > a:nth-child(1)");
	  this.waitForSelector('form[action="https://accounts.google.com/ServiceLoginAuth"]', function() {
	    this.fill('form[action="https://accounts.google.com/ServiceLoginAuth"]', {
	      'Email': auth.GAuser(),
	      'Passwd': auth.GApass()
	    }, true);
	  });
	});
}

exports.initUATrackingCode = function() {
	casper.then(function() {
	  this.wait(4000, function() {
	    this.page.injectJs('jquery.js');
	    var analyticsMaxName = GA.findGreatestProperty();
	    this.wait(4000, function() {
	      this.echo(analyticsMaxName);
	      this.click('#ID-newKennedyHeader > header > div.ID-headerWidget-tabs._GACPb > a.ID-tab-a._GAKn.ACTION-tab.TARGET-a > div > span');
	      this.wait(4000, function() {
	        this.click('._GAgU[title="'+ analyticsMaxName +'"]'); 
	        GA.isPropertyFull();
	        GA.initVin65UAcode();
	      });
	    });
	  });
	});
}

exports.findGreatestProperty = function() {
	var analyticsMaxName =	casper.evaluate(function() {
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
	return analyticsMaxName
}

exports.isPropertyFull = function() {
	casper.wait(4000, function() {
	  this.waitFor(function check() {
	      return this.evaluate(function() {
	          return document.querySelectorAll('#ID-m-propertyColumn-picker > div.ID-propertyPicker > div > div._GAYTb > div > div._GAdJ.ACTION-add.TARGET-').length === 1;
	      });
	  }, function then() {    // step to execute when check() is ok
	  		//Property is not full, add site to property
	      this.click('#ID-m-propertyColumn-picker > div.ID-propertyPicker > div > div._GAYTb > div > div._GAdJ.ACTION-add.TARGET-');
	      this.wait(4000, function() {
	        this.echo("Setting up a UA-Tracking code for your website...");
	        this.click('[data-value="FOOD_AND_DRINK"]');
	        this.evaluate(function(userInputWebsiteURL) {
	          $('#ID-m-content > div > div.ID-webParams > div:nth-child(1) > div._GAAY > input').add('#ID-m-content > div > div.ID-webParams > div:nth-child(2) > div._GAAY > div > div > input').val(userInputWebsiteURL);
	          $('[data-value="FOOD_AND_DRINK"]').trigger('click');
	        }, userInputWebsiteURL);
	        this.wait(4000, function() {
	          this.click('#ID-m-content > div > div._GAFk > button._GAN._GABc._GAJe');
	        });
	      });
	  }, function timeout() { // step to execute if check has failed
	  		//Property is full, add a new property and add site to that property
	      this.echo( analyticsMaxName + " has 50 websites. Setting up a fresh one...");
	      this.click('#ID-m-accountColumn-picker > div.ID-accountPicker > div > div._GAYTb > div > div._GAdJ.ACTION-add.TARGET-');
	      this.wait(4000, function() {
	        this.click('[data-value="FOOD_AND_DRINK"]');
	        this.evaluate(function(analyticsMaxName,userInputWebsiteURL) {
	          var analyticsNum = analyticsMaxName.replace('Web Analytics ', '');
	          $('[aria-label="My New Account Name"]').val("Web Analytics " + ++analyticsNum);
	          $('#ID-m-content > div > div.ID-webParams > div:nth-child(2) > div._GAAY > div > div > input').add('[aria-label="My New Website"]').val(userInputWebsiteURL);
	        }, analyticsMaxName,userInputWebsiteURL);
	        this.wait(4000, function() {
	          this.click('#ID-m-content > div > div._GAFk > button._GAN._GABc._GAJe');
	        });
	        this.wait(4000, function() {
	          this.click('body > div._GAfe > div._GAfe-_GAY > div._GATd > input.ACTION-confirmToS.TARGET-._GAy');
	        });
	      });
	  });
	});
}

exports.initVin65UAcode = function() {
	casper.waitForSelector('#ID-m-content-header > div._GAgmb > div > div._GALRb', function() {
	  this.wait(4000, function() {
	    var googleAnalyticsUAcode = this.evaluate(function() {
	      var UAcode = $('#ID-m-content-header > div._GAgmb > div > div._GALRb').text();
	      return UAcode;
	    });
	    this.echo("Tracking Code: " + googleAnalyticsUAcode);
	    vin65.login();
	    vin65.grabWebsiteID();
	    vin65.validateWebsiteID();
	    vin65.initGoogleAnalytics(googleAnalyticsUAcode);
	    oneClick.stageComplete('#analyticsComplete', 'Google Anayltics were successfully added!');
	  });
	});
}