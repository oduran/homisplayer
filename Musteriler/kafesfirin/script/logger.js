/*Class that is responsible for logging to systemlog.txt file*/
var Logger = function()
{
   this.log = function(logMessage, fileName)
	{
		var uniqueId = "kafes1"; //create unique id here from machine or file.
		var fs = require('fs');
		var path = require('path'); 
		var record = new Object();
		var currentTime = new Date();
		var logFileName = "systemlog_" + currentTime.getFullYear() + "_" + currentTime.getMonth() + "_" + currentTime.getDate() + ".log";
		var fileName = (typeof(fileName) === 'undefined')? "NoFile": fileName;
		record.client = uniqueId;
		record.message = logMessage;
		record.fileName = fileName;
		record.date = currentTime;
		record.year = record.date.getFullYear();
		record.month = record.date.getMonth();
		record.day = record.date.getDate()
		record.hour = record.date.getHours();
		record.minute = record.date.getMinutes();
		record.second = record.date.getSeconds();
		var fullMessage = JSON.stringify(record);
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
