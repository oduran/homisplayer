/*APPLICATION FUNCTIONS AND CLASSES.*/
var startApp = function()
{
	var backupPage = "nointernet.html";
	var internetPagesArray = [{id : "applicationframe", url : "ekrand.html?twitterId=677839432498720768&twitterName=bakalim_nolcak&sliderMedia=instagram"}];
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