//Vin65 Admin Panel Setup
var require = patchRequire(require);
var utils = require('utils');
var auth = require('./auth');
var oneClick = require('./oneClick');
var vin65 = require('./vin65');
var vin65Plus = require('./vin65Plus');

exports.login = function() {
	casper.thenOpen('https://www.twilio.com/login', function() {
    this.fill('form', {
      'email': auth.twilioUser(),
      'password': auth.twilioPass()
    }, true);
	});
}

exports.buyNumber = function() {
	casper.wait(2000, function() {
		this.thenOpen('https://www.twilio.com/user/account/phone-numbers/search', function() {
			this.wait(5000, function() {
				this.click('.selectize-control.country > .selectize-input');
				this.wait(1000, function(){
					this.click('.selectize-dropdown.country > .selectize-dropdown-content > [data-value="'+userInputWebsiteCountry+'"]');
				});
				this.wait(1000, function() {
					this.capture('country.png');
				});
			});
			this.then(function() {
				this.wait(1000, function() {
					this.click('.selectize-control.prepend > .selectize-input');
					this.wait(1000, function() {
						this.click('.selectize-dropdown.prepend > .selectize-dropdown-content > [data-value="location"]');
					});
					this.wait(1000, function() {
						var searchTerm = userInputWebsiteCity + ", " + userInputWebsiteState;
						this.fill('[action="/user/account/phone-numbers/search/results"]', {
							'searchTerm': searchTerm
						}, true);
						this.wait(5000, function() {
							this.capture('error.png');
							this.click('#numbers-list > tbody > tr:nth-child(1) > td.text-center > a');
						});
						this.wait(3000, function() {
							this.click('[name="buy-number-button"]');
						});
						this.wait(5000, function(){
							this.click('.modal-footer > .btn.btn-primary');
						});
						this.wait(5000, function() {
							this.click('.icon-pencil');
							var SMSNumber = this.evaluate(function(userInputWebsiteName) {
								$('[name="FriendlyName"]').val(userInputWebsiteName);
								$('[name="FriendlyName"]').attr('value', userInputWebsiteName)
								$('#SmsUrl').val("https://systemtools.uswest.vin65.com/twilio/receiveText.cfm");
							}, userInputWebsiteName);
						});
						this.wait(1000, function() {
							this.click('[data-analytics-title="configure-number-save"]');
						});
						this.wait(4000, function() {
							var SMSNumber = this.evaluate(function() {
								var number = $('[data-s="phone-number"]').text();
								return number.replace('+1', '');
							});
						  this.echo("SMS Number: " + SMSNumber);
						  vin65.login();
						  vin65.grabWebsiteID();
						  vin65.validateWebsiteID();
						  vin65Plus.addTwilioNumber(SMSNumber);
						  oneClick.stageComplete('#twilioComplete', 'Twilio SMS Number was successfully added!');
						});
					});
				});
			});
		});
	});
}