//pages required to loop, 10min = 600000 milliseconds
var pages = [
   {url:"ekranlarge.html", duration:600000 }, 
   {url:"videopage.html", duration:40000 }, 
   {url:"ekranlarge.html", duration:600000 }, 
   {url:"videopagenewyear.html", duration:46000 }
];

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
	if(pages.length === 0)
	{
		return false;
	}
	
	var pageIndex = 0;
	var excludedTimeInterval;
	this.openNextPage = function()
	{
		document.getElementById("applicationframe").src = pages[pageIndex].url;
		self.setVideoTimer(self.excludedTimeInterval);
	}

	this.setVideoTimer=function(excludedTimeInterval)
	{
		self.excludedTimeInterval = excludedTimeInterval;
		var rotateInterval = pages[pageIndex].duration;
		var presentTime = new Date();
		var futureTime = new Date(2500, 1, 1, presentTime.getHours(), presentTime.getMinutes(), presentTime.getSeconds(), 0);
		var totalRotateInterval = 0;
		
		pageIndex = (pageIndex + 1) % pages.length;
		if(!pages[pageIndex].url.indexOf("video") == -1)
		{
			setTimeout(function()
				{
					self.openNextPage();
				}, rotateInterval);
		}
		
		do
		{
			totalRotateInterval += rotateInterval;
			futureTime.setMilliseconds(futureTime.getMilliseconds() + rotateInterval);
			var isTimeExcluded = excludedTimeInterval.checkTimeIfExcluded(futureTime);
		}while(isTimeExcluded);
		
		setTimeout(function()
		{
			self.openNextPage();
		},totalRotateInterval);
	}
	
	//// Javascript convention to call methods in object.
	var self = this;
}

/*APPLICATION FUNCTIONS AND CLASSES.*/
var startApp = function()
{
	var videoTimer = new VideoTimer();
	var excludedFrom = new Date(2500, 1, 1, 12, 0, 0, 0);
	var excludedTo = new Date(2500, 1, 1, 14, 0, 0, 0);
	var excludedTimeInterval = new ExcludedTimeInterval(excludedFrom,excludedTo);
	videoTimer.setVideoTimer(excludedTimeInterval);
	var logger = new Logger();
	logger.startDiagnostics(5);
}

startApp();