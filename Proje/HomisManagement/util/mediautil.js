/*
Önder ALTINTAÞ 27.02.2016
Manages media upload service
*/

var MediaManager = function()
{
  var Jimp = require("jimp");
  
  // Creates given image's thumbnail with given width and height on given path. 
  // Media resource should have fileType, fileName properties. Thumbnail name will be thumb_filename
  this.createThumbnail = function(mediaResource, path, width, height)
  {
    switch(mediaResource.fileType)
    {
      case "image":
        createImageThumbnail(mediaResource, path, width, height);
      break;
      case "video":
        //To be implemented
      break;
      default:
        //To be implemented
      break;
    }
  };
  
  // Creates image thumbnail
  var createImageThumbnail = function(mediaResource, path, width, height)
  {
    var originalFilePath = path + mediaResource.fileName;
    var thumbnailFilePath = path + "thumb_" + mediaResource.fileName;
    Jimp.read(originalFilePath, function (err, lenna) {
    if (err) throw err;
    lenna.resize(width, height)            // resize 
         .quality(50)                 // set JPEG quality 
         .write(thumbnailFilePath); // save 
    });
  };
};

module.exports = {
  MediaManager: MediaManager
};