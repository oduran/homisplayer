/*APPLICATION FUNCTIONS AND CLASSES.*/
var startApp = function()
{
	/*Read json config*/
	
	var backupPage = "nointernet.html";
	var internetPagesArray = [
			{
			id : "applicationframe",
			url : "ekrand.html?twitterId="+appConfig.twitterId+"&twitterName="+appConfig.twitterName+"&swarmVenueId="+appConfig.swarmVenueId+"&swarmOauthToken="+appConfig.swarmOauthToken+"&sliderMedia="+appConfig.sliderMedia
			}
		];
		
	var internetChecker = new InternetChecker(backupPage,internetPagesArray);
	internetChecker.start(5000);
	var logger = new Logger();
	logger.log("Application started","application.html");
	logger.startDiagnostics(5);
	var errorHandler = new ErrorHandler();
	errorHandler.start();
}

startApp();
