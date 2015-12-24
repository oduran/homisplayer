/*
  Class that is responsible for logging events to eventlog.log file and 
  electricity cut events to diagnostics.log file
  can be expanded
*/
var Logger = function()
{
   this.log = function(logMessage, fileName)
	{
		var clientId = "kafes1"; //create unique id here from machine or file.
		if(typeof(require) === "undefined")
		{
			console.log("Require is not defined. Not an application");
			return false;
		}
		
		var fs = require('fs');
		var path = require('path'); 
		var record = new Object();
		var currentTime = new Date();
		var logFileName = "/home/homis/log/" + "eventlog_" + currentTime.getFullYear() + "_" + currentTime.getMonth() + "_" + currentTime.getDate() + ".log";
		var fileName = (typeof(fileName) === 'undefined')? "NoFile": fileName;
		record.client = clientId;
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
	
	this.startDiagnostics = function(intervalSeconds)
	{
		if(typeof(require) === "undefined")
		{
			console.log("Require is not defined. Not an application");
			return false;
		}
		
		var clientId = "kafes1"; //create unique id here from machine or file.
		var fs = require('fs');
		var path = require('path'); 
		var currentTime = new Date();
		var logFileName = "/home/homis/log/" + "diagnostics_" + currentTime.getFullYear() + "_" + currentTime.getMonth() + "_" + currentTime.getDate() + ".log";
		var healthReport = "{ clientId:'" +clientId+ "', startTime: { year: "+currentTime.getFullYear()+", month:"+currentTime.getMonth()+", day:"+currentTime.getDate()+", hour:"+currentTime.getHours()+", minute:"+currentTime.getMinutes()+", second:"+currentTime.getSeconds()+"}, \n";
		healthReport += " endTime: { year: "+currentTime.getFullYear()+", month:"+currentTime.getMonth()+", day:"+currentTime.getDate()+", hour:"+currentTime.getHours()+", minute:"+currentTime.getMinutes()+", second:"+currentTime.getSeconds()+"}}";
		path.exists(logFileName, function(exists) { 
		  if (exists) { 
			fs.appendFile(logFileName, "\n" + healthReport, function(err) {
				if(err) {
				}
			});
		  } 
		  else
		  {
			fs.writeFile(logFileName, healthReport, function(err) {
				if(err) {
				}
			});
		  }
		}); 
		
		setInterval(function()
		{
			var clientId = "kafes1"; //create unique id here from machine or file.
			var fs = require('fs');
			var path = require('path');
			var currentTime = new Date();
			var logFileName = "/home/homis/log/" + "diagnostics_" + currentTime.getFullYear() + "_" + currentTime.getMonth() + "_" + currentTime.getDate() + ".log";
			var healthReport = " endTime: { year: "+currentTime.getFullYear()+", month:"+currentTime.getMonth()+", day:"+currentTime.getDate()+", hour:"+currentTime.getHours()+", minute:"+currentTime.getMinutes()+", second:"+currentTime.getSeconds()+"}}";
			path.exists(logFileName, function(exists) { 
				if (exists) {
					fs.readFile(logFileName, 'utf-8', function(err, data) {
						if (err) throw err;
						var text = data.substring(0, data.lastIndexOf("\n"))
						fs.writeFile(logFileName, text + "\n" + healthReport, function(err) {
							if(err) {
								alert("error");
							}
						});
					});
				}
				else
				{
					healthReport = "{ clientId:'" +clientId+ "', startTime: { year: "+currentTime.getFullYear()+", month:"+currentTime.getMonth()+", day:"+currentTime.getDate()+", hour:"+currentTime.getHours()+", minute:"+currentTime.getMinutes()+", second:"+currentTime.getSeconds()+"}, \n" + healthReport;
					fs.writeFile(logFileName, healthReport, function(err) {
						if(err) 
						{
						}
					});
				}					
			}); 
		}, intervalSeconds * 1000);
	}
}
