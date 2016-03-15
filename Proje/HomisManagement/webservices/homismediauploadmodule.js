/**
 * Creates an instance of HomisMediaUploadManager.
 * @class
 * @classdesc Manages media upload service operations.
 * Önder ALTINTAŞ 27.02.2016
 * @constructor
 * @param {DbManager} dbManager - Database manager object to handle database operations.
 * @param {string} rootDir - Root directory to save the media files.
 */
var HomisMediaUploadManager = function(dbManager, rootDir)
{
  var dbManager = dbManager;
  var rootDir = rootDir || __dirname;
  var fs = require("fs");
  var FileManager = require('../util/fileutil').FileManager;
  var MediaManager = require('../util/mediautil').MediaManager;
  var fileManager = new FileManager();
  var mediaManager = new MediaManager();
  var mediaUploaders = [];
  fileManager.ensureDirectoryExists(rootDir,function(){});
  
  /**
   * Gets a workspace with given access token of the user and workspace id.
   * @param {Request} req - Node request object.
   * @param {Response} res - Node response object.
   */
  this.saveMediaResource = function (req, res)
  {
    var accessToken = req.cookies.accessToken;
    var totalNumberOfFiles = 0;
    var username = "";
    req.pipe(req.busboy);
    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
      if(key === "totalNumberOfFiles") 
      {
        totalNumberOfFiles = value;
      }
      if(key === "name") 
      {
        username = value;
      }
    });
    
    req.busboy.on('error', function(err) {
      console.error(err);
      res.send(500, 'ERROR', err);
    });
    
    req.busboy.on('file', function (fieldname, file, filename) {
      dbManager.getUserByAccessToken(accessToken, 
      function(user)
      {
        if(user.type == "admin" && username)
        {
          dbManager.getUserByName(username, 
          function(userToEdit)
          {
            handleMediaResource(userToEdit, file, filename, totalNumberOfFiles, req, res);
          });
        }
        else
        {
          handleMediaResource(user, file, filename, totalNumberOfFiles, req, res);
        }
      });
    });
  };
  
  /**
   * Sets media source's properties. Adds url, thumbnailUrl, uploadCompleted and other file Object properties. 
   * See FileManager.getFileObject
   * @param {User} user - MongoDb Homis User type object.
   * @param {File} file - Node file.
   * @param {string} filename - Filename to save file.
   * @param {string} totalNumberOfFiles - Total number of files to be handled. Should be parsed with parseInt method.
   * @param {Request} req - Node request object.
   * @param {Response} res - Node response object.
   */
  var handleMediaResource = function(user, file, filename, totalNumberOfFiles, req, res)
  {
    var fstream;
    var userFound = false;
    var userId = user._id;
    var directoryToSave = rootDir + userId + "/";
    var mediaResource = fileManager.getFileObject(filename);
    mediaResource.url = "mediaresources/" + userId + "/" + filename;
    mediaResource.thumbnailUrl = "mediaresources/" + userId + "/thumb_" +filename;
    mediaResource.uploadCompleted = false;
    fileManager.ensureDirectoryExists(directoryToSave,function(){});
    for(var i = 0; i< mediaUploaders.length;i++)
    {
      if(user.name === mediaUploaders[i].name)
      {
        userFound = true;
        mediaUploaders[i].newMediaResources.push(mediaResource);
      }
    }
    
    if(!userFound)
    {
      if(!user.mediaResources)
      {
        user.mediaResources = [];
      }            
      if(!user.newMediaResources)
      {
        user.newMediaResources = [];
      }
      
      user.newMediaResources.push(mediaResource);
      user.totalNumberOfFiles = parseInt(totalNumberOfFiles);
      user.completedFiles = 0;
      console.log("Total number of "+ totalNumberOfFiles + " files will be uploaded. First file this is.");
      mediaUploaders.push(user);
    }
    
    fstream = fs.createWriteStream(directoryToSave + filename);
    file.pipe(fstream);
    console.log("file uploading");
    file.on('data', function(data) {
      //console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });
    fstream.on('close', function () {
      console.log("mediaUploadCompleted:"+new Date());
      var mediaUploader = "";
      var mediaUploaderIndex = 0;
      for(var i = 0;i<mediaUploaders.length;i++)
      {
          if(mediaUploaders[i].name === user.name)
          {
            for(var j=0;j<mediaUploaders[i].newMediaResources.length;j++)
            {
              console.log(filename+" "+mediaUploaders[i].newMediaResources[j].fileName);
              if(filename === mediaUploaders[i].newMediaResources[j].fileName)
              {
                mediaUploaders[i].newMediaResources[j].uploadCompleted = true;
                mediaUploaders[i].newMediaResources[j].fileSize = fstream.bytesWritten;
                mediaManager.createThumbnail(mediaUploaders[i].newMediaResources[j], directoryToSave, 150, 150);
              }
            }
            
            mediaUploaders[i].completedFiles++;
            console.log(mediaUploaders[i].completedFiles+" / " + mediaUploaders[i].totalNumberOfFiles+" completed");
            mediaUploader = mediaUploaders[i];
            mediaUploaderIndex = i;
          }
      }
      
      if(mediaUploader && mediaUploader.totalNumberOfFiles === mediaUploader.completedFiles)
      {
        console.log("All files finished, saving user to database");
        mediaUploader = cleanDirtyMediaUploader(mediaUploader);
        console.log("Removing user "+user.name+" from upload queue because of upload complete.");
        mediaUploaders.splice(mediaUploaderIndex, 1);
        dbManager.saveUser(mediaUploader,
        function()
        {
          console.log("file finished");
          res.json({message: "success"});           //where to go next
        });
      }
      else
      {
        res.json({message: "success"});           //where to go next
      }
    });
    
    // if at any time upload is cancelled by the user.
    req.on('close',function(){
      console.log("Uploading request cancel by "+user.name);
      for(var i = 0; i< mediaUploaders.length;i++)
      {
        if(mediaUploaders[i].name == user.name)
        {
          var cancelledMediaUploader = mediaUploaders[i];
          console.log("removing user "+user.name+" from upload queue.");
          mediaUploaders.splice(i,1);
          cancelledMediaUploader = cleanDirtyMediaUploader(cancelledMediaUploader);
          dbManager.saveUser(cancelledMediaUploader,
          function()
          {
            fstream.end(function(){
              fileManager.deleteFile(directoryToSave + filename);
            });
          });
        }
      }
    });
  }
  
  /**
  * Removes unnecessary attributes added while file uploading.
  * @param {MediaUploader} mediaUploader - The media uploader user.
  * @returns {MediaUploader} Cleaned media uploader.
  */
  var cleanDirtyMediaUploader = function(mediaUploader)
  {
    console.log("cleaning dirty media uploader "+mediaUploader.name);
    delete mediaUploader.totalNumberOfFiles;
    delete mediaUploader.completedFiles;
    for(var i = 0; i<mediaUploader.newMediaResources.length;i++)
    {
      var mediaUpload = mediaUploader.newMediaResources[i];
      if(mediaUpload.uploadCompleted)
      {
        delete mediaUpload.uploadCompleted;
        var mediaResourceFound = false;
        for(var j = 0;j<mediaUploader.mediaResources.length;j++)
        {
          if(mediaUpload.fileName === mediaUploader.mediaResources[j].fileName)
          {
              mediaUploader.mediaResources[j] = mediaUpload;
              mediaResourceFound = true;
          }
        }
        
        if(!mediaResourceFound)
        {
          mediaUploader.mediaResources.push(mediaUpload);
        }
      }
    }
    delete mediaUploader.newMediaResources;
    return mediaUploader;
  };
  
  var self = this;
};

module.exports = {
  HomisMediaUploadManager: HomisMediaUploadManager
};