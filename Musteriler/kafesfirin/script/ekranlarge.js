var startPage = function(){
	var backupPage = "ekrana.html";
	var internetPagesArray = [{id : "ekrandframe", url : "ekrand.html?twitterId=666636527968088064&twitterName=kafesfirin"}];
	var internetChecker = new InternetChecker(backupPage,internetPagesArray);
	internetChecker.start(5000);
	var logger = new Logger();
	logger.log("Video ended menu board is visible now","ekranlarge.html");
}	

startPage();