﻿/*APPLICATION FUNCTIONS AND CLASSES.*/
var startApp = function()
{
	var backupPage = "nointernet.html";
	var internetPagesArray = [{id : "applicationframe", url : "ekrand.html?twitterId=689785930517970944&twitterName=deliganspub"}];
	var internetChecker = new InternetChecker(backupPage,internetPagesArray);
	internetChecker.start(5000);
	var logger = new Logger();
	logger.log("Application started","application.html");
	logger.startDiagnostics(5);
	var errorHandler = new ErrorHandler();
	errorHandler.start();
	var internetChecker = new InternetChecker()
}

startApp();