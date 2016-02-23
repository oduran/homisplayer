/*
Önder ALTINTAŞ 18.01.2016
Creates directory and does other file operations.
If directory doesn't exist it creates directory.
Usage:
ensureExists(__dirname + '/upload', 0744, function(err) {
    if (err) // handle folder creation error
    else // we're all good
});
*/
const fs = require("fs");
const zlib = require('zlib');

/*
 Creates directory.
*/
var ensureDirectoryExists = function(path, mask, cb) 
{
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 7777;
    }
    
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

/*
 Writes data to file with given filename, if user requires, gzips the file the same folder.
*/
var writeToFile = function(path,data,gzipAfter)
{
	var gzipIt = (typeof gzipAfter ==="undefined")? false : gzipAfter;
	fs.exists(path, function(exists) { 
		  if (exists) { 
			fs.appendFile(path, data, "utf8", function(err) {
				if(err) {
					console.log(err.message);
					console.log("HATAA");
				}
				
				if(gzipIt)
				{
					gzipFile(path);
				}
			});
		  } 
		  else
		  {
			fs.writeFile(path, data, "utf8", function(err) {
				if(err) {
					console.log(err.message);
					console.log("HATAA2");
				}
				
				if(gzipIt)
				{
					gzipFile(path);
				}
			});
		  }
	}); 
}

/*
 Gzips the file and saves the same folder with .gz extension.
*/
var gzipFile = function(path)
{
	fs.exists(path, function(exists) { 
		const gzip = zlib.createGzip();
		const inp = fs.createReadStream(path);
		const out = fs.createWriteStream(path+".gz");
		inp.pipe(gzip).pipe(out);
	});
}

/*
writes property names as table header and values as table tab spaced
path: path and file name to write file.
tableObjects: must be an arry that holds values. array's first element's keys will be written as header.
*/
var writeTableFile = function(path, tableObjects)
{
	var tableString = "";
	var tableHeader = "";
	var keys=new Array();
	if(tableObjects.length === 0)
	{
		return false;
	}
	
	for (var key in tableObjects[0]) {
		tableHeader+= key+"\t";
		keys.push(key);
	}
	
	tableHeader+="\n";
	for(var i=0;i<tableObjects.length;i++)
	{
		for(var j=0; j < keys.length; j++)
		{
			tableString+= tableObjects[i][keys[j]]+"\t";
		}
		tableString+="\n";
	}
	
	fs.exists(path, function(exists) { 
		  if (exists) { 
			fs.appendFile(path, tableString, "utf8", function(err) {
				if(err) {
					console.log(err.message);
				}
			});
		  } 
		  else
		  {
			  tableString = tableHeader + tableString;
			fs.writeFile(path, tableString, "utf8", function(err) {
				if(err) {
					console.log(err.message);
				}
			});
		  }
	}); 
}

var loadFileToJson = function(path, callback)
{
	var exists = fs.existsSync(path); 
	if (exists) 
	{ 
		var fileContent = fs.readFileSync(path).toString();
		var jsonResult = JSON.parse(fileContent);
		console.log("local file length:"+jsonResult.length);
		callback(jsonResult);
		console.log(path+" file is exist.");
		return true;
	} 
	else
	{
		console.log(path+" file doesn't exist");
		return false;
	}
	return false;
}

var getFilesListChronological = function(path, extension)
{
	var files = fs.readdirSync(path)
	var resultFiles = new Array();
	if(typeof extension !== "undefined")
	{
		for(var i in files) {
		   if(fs.extname(files[i]) === extension) {
			   resultFiles.push(files[i]);
		   }
		}
	}
	else
	{
		resultFiles = files;
	}
	
	resultFiles.sort(function(a, b) {
			   return fs.statSync(dir + a).mtime.getTime() - 
					  fs.statSync(dir + b).mtime.getTime();
		   });
		   
	return resultFiles;
}

module.exports = {
  ensureDirectoryExists: ensureDirectoryExists,
  writeToFile: writeToFile,
  gzipFile: gzipFile,
  writeTableFile: writeTableFile,
  loadFileToJson: loadFileToJson,
  getFilesListChronological: getFilesListChronological
};
