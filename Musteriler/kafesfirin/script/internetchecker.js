/*INTERNET CHECKER FUNCTIONS AND CLASSES.*/
/*
InternetChecker checker class that gets backup url and internet page Ids array.
When there is no connection to internet with given check time interval. 
Checker applies the backup url to iframes given in internetPageIdArray.
*/
var InternetChecker = function(backupUrl, internetPagesArray){
	this.backupUrl = backupUrl;
	this.internetPagesArray = internetPagesArray;
	this.onConnectSuccess = function() {
		for(var i=0;i < self.internetPagesArray.length; i++)
		{
		  var url = document.getElementById(self.internetPagesArray[i].id).src;
			var cleanUrl = url.split('\\')[url.split('\\').length-1].split('/')[url.split('\\')[url.split('\\').length-1].split('/').length - 1];
			if( cleanUrl !== ""+self.internetPagesArray[i].url)
			{
				document.getElementById(self.internetPagesArray[i].id).src = ""+self.internetPagesArray[i].url;
				var logger = new Logger();
				logger.log("Internet connection came back, returning to normal state.","ekranlarge.html");
			}
		}
	}
	
	this.onConnectFail = function() {
		for(var i=0;i < self.internetPagesArray.length; i++)
		{
			var url = document.getElementById(self.internetPagesArray[i].id).src;
			var cleanUrl = url.split('\\')[url.split('\\').length-1].split('/')[url.split('\\')[url.split('\\').length-1].split('/').length - 1];
			if(cleanUrl !== ""+backupUrl)
			{
				document.getElementById(self.internetPagesArray[i].id).src = ""+backupUrl
				var logger = new Logger();
				logger.log("Internet connection problem, backup page is being loaded.","ekranlarge.html");
			}
		}
	}
    this.start = function(timeInterval)
	{	
		setInterval(function()
		{
			var i = new Image();
			i.onload = self.onConnectSuccess;
			i.onerror = self.onConnectFail;
			//// CHANGE IMAGE URL TO ANY IMAGE YOU KNOW IS LIVE
			//// escape(Date()) is necessary to override possibility of image coming from cache
			i.src = 'http://gfx2.hotmail.com/mail/uxp/w4/m4/pr014/h/s7.png?d=' + escape(Date());
		},timeInterval);
	}
	
	//// Javascript convention to call methods in object.
	var self = this;
}