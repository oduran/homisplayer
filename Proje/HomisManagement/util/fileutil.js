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
var FileManager = function()
{
  const fs = require("fs");
  const zlib = require('zlib');

  /*
   Creates directory.
   path: directory to be created.
   mask: rights, chmod like mask
   callback: function to be executed if error happens.
  */
  this.ensureDirectoryExists = function(path, mask, callback) 
  {
      if (typeof mask == 'function') { // allow the `mask` parameter to be optional
          callback = mask;
          mask = 7777;
      }
      
      fs.mkdir(path, mask, function(err) {
          if (err) {
              if (err.code == 'EEXIST') callback(null); // ignore the error if the folder already exists
              else callback(err); // something else went wrong
          } else callback(null); // successfully created folder
      });
  }

  /*
   Writes data to file with given filename, if user requires, gzips the file the same folder.
  */
  this.writeToFile = function(path,data,gzipAfter)
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
  this.gzipFile = function(path)
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
  this.writeTableFile = function(path, tableObjects)
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

  this.loadFileToJson = function(path, callback)
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

  this.getFilesListChronological = function(path, extension)
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
  
  // Creates json object for media files. Includes extension, filename, media type
  this.getFileObject = function(filename)
  {
    var extension = filename.split('.').pop();
    var fileType = this.getFileType(extension);
    var fileObject = {fileName: filename, fileType: fileType, extension: extension};
    return fileObject;
  }
  
  // Returns file type. Right now only video and picture types can be recognized.
  this.getFileType = function(extension)
  {
    var lowerCaseExtension = extension.toString().toLowerCase();
    switch(lowerCaseExtension)
    {
      case "avi":
      case "webm":
      case "mp4":
      case "ogg":
        return "video"
        break;
      case "jpg":
      case "png":
      case "bmp":
      case "jpeg":
      case "tif":
        return "image"
        break;
      default:
        return "unknown";
    }
  }
  
  this.deleteFile = function(filePath)
  {
    console.log("Deleting file:" + filePath);
    fs.unlink(filePath, function(err){
      if (err) throw err;
      console.log("Deleted file:" + filePath);
    });
  }
  
}

module.exports = {
  FileManager: FileManager
};
