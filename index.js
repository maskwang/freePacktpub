var config = require('./config.json'); 
var fs = require('fs');
var utils = require('utils');
var casper = require('casper').create({
	verbose: config.debug || false,
	logLevel: 'debug',
	timeout: 45000 , //脚本执行总时长
	pageSettings: {
	//	loadImages: false,
	//	loadPlugins: true
		'userAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'
	}
});

casper.outputEncoding = 'utf-8';
casper.options.viewportSize = {
	width: 1500,
	height: 1400
};
var imageDir = 'public/images/';
var cookieFilename = config.cookiePath + 'packtpubCookie';

var captureImage = function (fileName) {
	casper.capture(imageDir + fileName + '.png', {
		top: 0,
		left: 0,
		width: 1500,
		height: 1400
	});	
};

var loadCookie = function() {
	try {
		if (fs.exists(cookieFilename) && fs.isFile(cookieFilename)) {
			phantom.cookies = JSON.parse(fs.read(cookieFilename));
		}
		console.log('try load cookie');
	} catch (e) {
		console.log('cookie load error!');
	}
};

loadCookie();

// 检查cookie是否可用
var checkLoginUrl = 'https://www.packtpub.com/account';
casper.start(checkLoginUrl , function () {
	captureImage('check');	
});

casper.then(function () {
	captureImage('then');
	var currentUrl = this.getCurrentUrl();
	console.log('currentUrl:' + currentUrl);
	if(currentUrl.indexOf('register') >= 0) {
		captureImage( 'login' );
		// 没登录
		this.click('.login-popup');

		this.fill('form#packt-user-login-form' , {
				'email': config.username,
				'password': config.password
				} , true);

		captureImage( 'submit' );
		casper.waitForUrl('https://www.packtpub.com/account' , function() {
			captureImage('after login');
			var cookies = JSON.stringify(phantom.cookies);
			fs.write(cookieFilename, cookies , 644);
		});
	}
	else
	{
		console.log('login success from cookie file');
	}
});

casper.thenOpen('https://www.packtpub.com/packt/offers/free-learning' , function() {
	captureImage('free-learnging');
	this.click('div.book-claim-token-inner input.form-submit');
	casper.waitForUrl('https://www.packtpub.com/account/my-ebooks' , function() {
		captureImage('getFreeBook');
	});
});

casper.run();
