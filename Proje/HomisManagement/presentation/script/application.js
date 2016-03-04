/*APPLICATION FUNCTIONS AND CLASSES.*/
var startApp = function()
{
	/*Read json config*/
	
	var backupPage = "nointernet.html";
  debugger;
	var internetPagesArray = [
			{
			id : "applicationframe",
			url : "theme5.html?twitterId=689785930517970944&twitterName=deliganspub&swarmVenueId=56a8999b498e6d9f0d8add0c&swarmOauthToken=A5P5WIBWXDOX5PJRMWL3NDI2LVQX2HVJQBAC0CZHMS2RIM15&sliderMedia=instagram"
			}
		];
      debugger;

	var internetChecker = new InternetChecker(backupPage,internetPagesArray);
 	internetChecker.start(5000);
 	var logger = new Logger();
	logger.log("Application started","application.html");
	logger.startDiagnostics(5);
	var errorHandler = new ErrorHandler();
	errorHandler.start();
}

startApp();
