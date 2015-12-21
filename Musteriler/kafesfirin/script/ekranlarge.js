/*VIDEO TIMER FUNCTIONS AND CLASSES.*/

/*Excluded time class to set in what time video rotation will not happen.*/
var ExcludedTimeInterval = function(from, to)
{
	if(from.getTime() > to.getTime())
	{
		var temp = to;
		to=from;
		from=temp;
	}
	
	this.from = from;
	this.to = to;
	
	this.checkTimeIfExcluded = function(givenTime)
							   {
									return from.getTime() < givenTime.getTime() && to.getTime() > givenTime.getTime(); 
							   }
}

var VideoTimer = function(){
	this.openVideoPage = function()
	{
		window.open ('videopage.html','_self',false);
	}

	this.setVideoTimer=function(rotateInterval, excludedTimeInterval)
	{
		var presentTime = new Date();
		var futureTime = new Date(2500, 1, 1, presentTime.getHours(), presentTime.getMinutes(), presentTime.getSeconds(), 0);
		var totalRotateInterval = 0;
		do
		{
			totalRotateInterval += rotateInterval;
			futureTime.setMilliseconds(futureTime.getMilliseconds() + rotateInterval);
			var isTimeExcluded = excludedTimeInterval.checkTimeIfExcluded(futureTime);
			console.log("Calculating future time if excluded... => " + futureTime.toString() + " isExcluded =>" + isTimeExcluded.toString());
		}while(isTimeExcluded);
		
		console.log("Next video execution time: "+ futureTime.toString()+" Total rotate interval in ms:" + totalRotateInterval);
		setTimeout(function()
		{
			self.openVideoPage();
		},totalRotateInterval);
	}
	
	//// Javascript convention to call methods in object.
	var self = this;
}

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

/*APPLICATION FUNCTIONS AND CLASSES.*/
var startApp = function()
{
	var videoTimer = new VideoTimer();
	var rotateInterval = 600000;
	var excludedFrom = new Date(2500, 1, 1, 12, 0, 0, 0);
	var excludedTo = new Date(2500, 1, 1, 14, 0, 0, 0);
	var excludedTimeInterval = new ExcludedTimeInterval(excludedFrom,excludedTo);
	videoTimer.setVideoTimer(rotateInterval, excludedTimeInterval);
	
	var backupPage = "kafesfirinekrana.html";
	var internetPagesArray = [{id : "ekrandframe", url : "ekrand.html?twitterId=666636527968088064&twitterName=kafesfirin"}];
	var internetChecker = new InternetChecker(backupPage,internetPagesArray);
	internetChecker.start(5000);
	var logger = new Logger();
	logger.log("Video ended menu board is visible now","ekranlarge.html");
}

startApp();