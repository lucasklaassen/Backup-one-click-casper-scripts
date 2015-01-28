(function(){
    var utils = require('utils');
    var fs = require('fs');
    var casper = require('casper').create({
        verbose: true,
        logLevel: 'debug',
        waitTimeout: 5000,
        viewportSize: {
            width: 1000, height: 2000
        },
        pageSettings: {
            loadImages: true,
            loadPlugins: true,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/29.0.1547.2 Mozilla/5.0'
        }
    });

    var username = casper.cli.get(0);
    var password = casper.cli.get(1);

    casper.start();

    casper.thenOpen('https://www.vin65.com/components/clientLogin', function() {
        this.fill('#loginForm', { ClientU: username, ClientP: password }, true);
    });

    casper.then(function() {
        if(this.exists("select[name='WebsiteID'] option")){
            //build list of websites available to the user
            var websitelistSelector = "select[name='WebsiteID'] option";
            var listOfWebsites = this.getElementsInfo(websitelistSelector);

            var listOfWebsiteNames = ["true"];

            for(var i = 1; i < listOfWebsites.length; i++) {
                var obj = listOfWebsites[i];
                listOfWebsiteNames.push(obj.text);
            }

            fs.write("server/api/listOfWebsites.json", JSON.stringify(listOfWebsiteNames, undefined, 2), 'w');
        } else {
            var listOfWebsiteNames = ["false"];
            fs.write("server/api/listOfWebsites.json", JSON.stringify(listOfWebsiteNames, undefined, 2), 'w');
        }
    });
    casper.run();
})();
