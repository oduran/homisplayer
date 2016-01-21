/*APPLICATION FUNCTIONS AND CLASSES.*/
var startApp = function()
{
	var backupPage = "nointernet.html";
	var internetPagesArray = [{id : "applicationframe", url : "ekrand.html?twitterId=689738719436365825&twitterName=simitcidnys&swarmVenueId=56937639498e8777fbd7dcd3&swarmOauthToken=A32RT2V1XZ51X4WNK324FYUHNG3H4XNBHROINKMNM4NNJ0MI"}];
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
