/*Class that is responsible for logging to systemlog.txt file*/
var Logger = function()
{
   this.log = function(logMessage, fileName)
	{
		var fs = require('fs');
		var path = require('path'); 
		var currentTime = new Date();
		var logFileName = "systemlog_" + currentTime.getFullYear() + "_" + currentTime.getMonth() + "_" + currentTime.getDate() + ".log";
		var fileName = (typeof(fileName) === 'undefined')? "NoFile": fileName;
		var time = new Date();
		var fullMessage = time + 
						  " Message: " + logMessage+
						  " FileName: " + fileName +
						  " Hour: "+currentTime.getHours()+
						  " Minute: "+currentTime.getMinutes()+
						  " Second: " + currentTime.getSeconds();
		path.exists(logFileName, function(exists) { 
		  if (exists) { 
			fs.appendFile(logFileName, "\n" + fullMessage, function(err) {
				if(err) {
					alert("error");
				}
			});
		  } 
		  else
		  {
			fs.writeFile(logFileName, fullMessage, function(err) {
				if(err) {
					alert("error");
				}
			});
		  }
		}); 
	}
}
