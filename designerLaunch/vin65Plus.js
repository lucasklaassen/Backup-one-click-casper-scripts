//Vin65 Admin Panel Setup
var require = patchRequire(require);
var utils = require('utils');
var auth = require('./auth');
var oneClick = require('./oneClick');
var vin65 = require('./vin65');
var twilio = require('./twilio');

exports.initTwilio = function() {
	twilio.login();
	twilio.buyNumber();
};

exports.addTwilioNumber = function(SMSNumber) {
	casper.then(function() {
		this.evaluate(function() {
			$('html').prepend('<iframe src="/index.cfm?method=layout.showLayout&go=%2Fsettings%2Findex%2Ecfm%3Fmethod%3Dsettings%2Eframes%26deepLink%3DwebsiteSettings" class="websiteSettings"></iframe>');
	 		$('html').prepend('<iframe name="wineDirectSettings" class="wineDirectSettings"></iframe>');
		});
		this.wait(4000, function() {
			this.evaluate(function() {
				$('.wineDirectSettings').attr('src', '/settings/index.cfm?method=websiteSettings.WineDirectSettings');
			});
		});
		this.wait(4000, function() {
			this.evaluate(function(SMSNumber) {
				$('.wineDirectSettings').contents().find('[name="fromPhoneNumber"]').val(SMSNumber);
				$('.wineDirectSettings').contents().find('[name="hasTextMessage"]').attr('checked', true);
			}, SMSNumber);
		});
		this.wait(4000, function() {
			this.evaluate(function() {
				$('.wineDirectSettings').contents().find('form[action="index.cfm?method=websiteSettings.WineDirectSettingsSuccess"]').submit();
				$('html').prepend('<div id="twilioComplete"></div>');
			});
		});
	});
};