//Vin65 Admin Panel Setup
var require = patchRequire(require);
var utils = require('utils');
var auth = require('./auth');
var oneClick = require('./oneClick');

exports.login = function() {
	casper.thenOpen('https://www.vin65.com/components/clientLogin', function() {
	  this.fill('#loginForm', { ClientU: username, ClientP: password }, true);
	});
}

exports.grabWebsiteID = function() {
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
}

exports.validateWebsiteID = function() {
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
}

exports.initGoogleAnalytics = function(googleAnalyticsUAcode) {
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
}

exports.initProductLayouts = function() {
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
	oneClick.stageComplete('#productLayoutsComplete', 'Product Layouts were initialized!');
}

exports.websiteSettingsFunctions = function() {
	//Website Settings Pages Array
	var websiteSettingsPagesArray = ['/settings/index.cfm?method=websiteSettings.EditComponents',
	'/settings/index.cfm?method=websiteSettings.CopyPages',
	'/settings/index.cfm?method=websiteSettings.Ecommerce',
	'/settings/index.cfm?method=websiteSettings.Clubs',
	'/settings/index.cfm?method=websiteSettings.CopyWineAttributes',
	'/settings/index.cfm?method=websiteSettings.CopyBlogPosts',
	'/settings/index.cfm?method=websiteSettings.CopyEventCalendars',
	'/settings/index.cfm?method=websiteSettings.CopyShipping',
	'/settings/index.cfm?method=websiteSettings.editQuickSettings'];
	var initCheckboxes = function() {
	  casper.evaluate(function() {
	    $('.websiteSettingsFunctions').contents().find('input').prop('checked', true);
	  });
	}
	var initSelectOptions = function() {
	  casper.evaluate(function() {
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
	}
	var initSubmit = function() {
	  casper.withFrame('websiteSettingsFunctions', function() {
	    this.click('#popupFooterRight > a > img');
	  });
	}
	//Website Settings Automation
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
	    initCheckboxes();
	    this.wait(1000, function() {
	      initSubmit();
	    });
	  });
	  this.wait(4000, function() {
	    this.evaluate(function(websiteSettingsPagesArray) {
	      $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[1]);
	    }, websiteSettingsPagesArray);
	  });
	  this.wait(1000, function(){
	    var copyPages = initSelectOptions();
	    this.wait(2000, function() {
	      if(copyPages === false) {
	        this.echo("There are no websites to copy pages from. :( ").exit();
	      }
	    });
	    this.wait(1000, function() {
	      initSubmit();
	    });
	    this.wait(4000, function() {
	      this.evaluate(function(websiteSettingsPagesArray) {
	        $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[2]);
	      }, websiteSettingsPagesArray);
	    });
	    this.wait(1000, function() {
	      initCheckboxes();
	    });
	    this.wait(1000, function() {
	      initSubmit();
	    });
	  });
	  this.wait(4000, function() {
	    this.evaluate(function(websiteSettingsPagesArray) {
	      $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[3]);
	    }, websiteSettingsPagesArray);
	  });
	  this.wait(1000, function() {
	    initCheckboxes();
	  });
	  this.wait(1000, function() {
	    initSubmit();
	  });
	  this.wait(4000, function() {
	    this.evaluate(function(websiteSettingsPagesArray) {
	      $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[4]);
	    }, websiteSettingsPagesArray);
	  });
	  this.wait(1000, function() {
	    var copyPages = initSelectOptions();
	    this.wait(2000, function() {
	      if(copyPages === false) {
	        this.echo("There are no websites to copy pages from. :( ").exit();
	      }
	    });
	  });
	  this.wait(1000, function() {
	    initCheckboxes();
	  });
	  this.wait(1000, function() {
	    initSubmit();
	  });
	  this.wait(4000, function() {
	    this.evaluate(function(websiteSettingsPagesArray) {
	      $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[5]);
	    }, websiteSettingsPagesArray);
	  });
	  this.wait(1000, function() {
	    var copyPages = initSelectOptions();
	    this.wait(2000, function() {
	      if(copyPages === false) {
	        this.echo("There are no websites to copy pages from. :( ").exit();
	      }
	    });
	  });
	  this.wait(1000, function() {
	    initSubmit();
	  });
	  this.wait(4000, function() {
	    this.evaluate(function(websiteSettingsPagesArray) {
	      $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[6]);
	    }, websiteSettingsPagesArray);
	  });
	  this.wait(1000, function() {
	    var copyPages = initSelectOptions();
	    this.wait(2000, function() {
	      if(copyPages === false) {
	        this.echo("There are no websites to copy pages from. :( ").exit();
	      }
	    });
	  });
	  this.wait(1000, function() {
	    initSubmit();
	  });
	  this.wait(4000, function() {
	    this.evaluate(function(websiteSettingsPagesArray) {
	      $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[7]);
	    }, websiteSettingsPagesArray);
	  });
	  this.wait(1000, function() {
	    var copyPages = initSelectOptions();
	    this.wait(2000, function() {
	      if(copyPages === false) {
	        this.echo("There are no websites to copy pages from. :( ").exit();
	      }
	    });
	  });
	  this.wait(1000, function() {
	    initSubmit();
	  });
	  // Quick Settings
	  this.then(function() {
      this.wait(4000, function(){
        this.evaluate(function(websiteSettingsPagesArray) {
          $('.websiteSettingsFunctions').attr("src", websiteSettingsPagesArray[8]);
        }, websiteSettingsPagesArray);
      });
      this.wait(1000, function() {
        this.evaluate(function(userInputWebsiteCountry) {
          $('.websiteSettingsFunctions').contents().find('[name="countryCode"]').val(userInputWebsiteCountry);
        }, userInputWebsiteCountry);
        initSelectOptions();
      });
      this.wait(1000, function() {
      	initSubmit();
      });
	  });
		this.then(function() {
			this.wait(10000, function() {
				this.evaluate(function() {
				  $('html').prepend('<div id="websiteFunctionsComplete"></div>');
				});
			});
		});
	});
oneClick.stageComplete('#websiteFunctionsComplete', 'Website Functions were run successfully!');
}