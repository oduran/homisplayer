//Handles the errors that is thrown to nodejs directly
//Logs the error if logger.js is included and Logger class is defined
var ErrorHandler = function()
{
   this.start = function()
   {
		if(typeof(process)=== 'undefined')
		{
		   return false;
		}
		process.on('uncaughtException', 
			function(e) {
				if(typeof(Logger) === 'undefined')
				{
					console.log("hata:"+e.toString());
				}
				else{
					var logger = new Logger();
					logger.log("Unhandled exception => "+e.toString()+" => "+e.stack,"noFile");
				}
			}
		);
   }
}