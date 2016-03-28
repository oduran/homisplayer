 var PlayerManager = function()
 {
  var url = "http://www.bilimtek.com:8080";
  var fileManager = new FileManager();
  var playerUI = new PlayerUI(url);
  var downloading = false; 
  var playerId="";
  var directories =
  {
    presentation : "presentation",
    media : "presentation/media",
    css : "presentation/css",
    script : "presentation/script",
    public : "presentation/public",
    font : "presentation/media/font",
    weather : "presentation/media/weatherimages"
  };
  
  this.initializePlayer = function()
  {
    if(downloading)
    {
      return;
    }
    
    var getPlayerIdFromServer = getPlayerId();
    playerId = getPlayerIdFromServer;
    if(!playerId)
    {
      location.href="register.html";
    }
    
    var connectionExist = checkConnection();
    if(connectionExist)
    {
      createDirectories(function()
      {
        getPlayer(playerId,getPlayerSuccess);  
      });  
    }
    updatePlayerInterval();
  };
  
  var getPlayerId = function()
  {
    var fileContent = "";
    fileContent = fileManager.getFile("playerId.txt");
    return fileContent;
  };
  
  var getPlayerSuccess = function(response)
  {
    var player = response.player;
    if(!player.workspace)
    {
      return;
    }
    
    var previousPlayerFile = getPlayerFromFile();
    if(!Util.deepEquals(previousPlayerFile.workspace,player.workspace)&&player)
    {
      downloading = true;
      savePlayerToFile(player);
      var fileUrls = [];
      for(var i=0;i<player.workspace.walls.length;i++)
      {
        for(var j = 0;j<player.workspace.walls[i].screens.length;j++)
        {
          var newFileUrls = getFileUrls(player.workspace.walls[i].screens[j].html);
          fileUrls = mergeArrays(fileUrls,newFileUrls);
          player.workspace.walls[i].screens[j].html = changeHtmlUrls(player.workspace.walls[i].screens[j].html);
        }
      }
      getFiles(fileUrls,player,getFilesSuccess);
    }
    else if(previousPlayerFile.toString())
    {
      for(var i=0;i<previousPlayerFile.workspace.walls.length;i++)
      {
        for(var j = 0;j<previousPlayerFile.workspace.walls[i].screens.length;j++)
        {
          previousPlayerFile.workspace.walls[i].screens[j].html = changeHtmlUrls(previousPlayerFile.workspace.walls[i].screens[j].html);
        }
      }
      
      playerUI.showWorkspace(previousPlayerFile);
    }
  };

  var updatePlayerInterval = function()
  { 
    setInterval(function(){updatePlayerState("running")},20000);
  };
  
  var updatePlayerState = function(playerState)
  {
    var data = { playerId : playerId,playerState : playerState,playerLastSeen:(new Date()).toString()};
    $.ajax({
      type: "POST",
      url: url+"/service/updateplayer",
      data: data,
      success:function(){},
      error: function(error){}
    });    
  } 
  
  var getFilesSuccess = function(files,player)
  {
    var cssFiles = [];
    
    for(var i = 0 ; i<files.length ; i++)
    {
      if(files[i].indexOf("css")>0)
      {     
        cssFiles.push(files[i]);
      }
    }
    
    var downloadedCssFiles=0;
    for(var i = 0 ; i<cssFiles.length ; i++)
    {
        var cssContent = getCssFile(cssFiles[i]);
        cssContent = changeCssUrls(cssContent);
        saveCssToFile(cssContent,cssFiles[i]);
        downloadCssMedia(cssContent,function()
        { 
          
          downloadedCssFiles++;
          if(downloadedCssFiles===cssFiles.length)
          {
            playerUI.showWorkspace(player);  
            downloading = false;
          }
        });
    }
  };
  
  var checkConnection = function()
  {
      return true;
  };
  
  var getCssFile = function(fileUrl)
  {
    var result = fileManager.getFile("presentation"+fileUrl);
    return result;  
  };
  
  var getPlayer = function(playerId,callback)
  { 
    var data = { playerId:playerId };
    $.ajax({
      type: "POST",
      url: url+"/service/getplayer",
      data: data,
      success:callback,
      error: function(error){}
    });
  };
  
  var savePlayerToFile = function(player){
    fileManager.writeToFile("player.txt",JSON.stringify(player),false,true);
  };
  
  var getPlayerFromFile = function()
  {
    var result = fileManager.loadFileToJSON("player.txt");
    return result;
  };
  
  var getFileUrls = function(htmlContent)
  {
    var fileUrls=[];
    var regex = /(href=|src=)\"(.*?)(\.css|\.js|\.webm|\.jpeg|\.jpg|\.png)"|(href=|src=)\'(.*?)(\.css|\.js|\.webm|\.jpeg|\.jpg|\.png)'/g;
    var result = htmlContent.match(regex);
    if(!result)
    {
      return fileUrls;
    }
    
    for(var i = 0 ;i<result.length ; i++)
    {
      result[i] = result[i].replace("href=","").replace("src=","").replace(/\"/g,"");
    }

    fileUrls = mergeArrays(fileUrls,result);
    return fileUrls;
  };
  
  var getFiles = function(fileUrls,player,callback)
  {
    var completedFiles = 0;
    for(var i = 0; i<fileUrls.length;i++)
    {
      getFile(fileUrls[i],function(response)
      {
        completedFiles++;
        if(completedFiles == fileUrls.length)
        {
          callback(fileUrls,player);
        }
      });
    }  
  };
  
  var changeHtmlUrls = function(htmlContent)
  {
    var regex = (/(?=([\w&./\-]+)(script|css|media)\/)/gm);
    var replaceString = '../presentation';
    var htmlContent = htmlContent.replace(regex, replaceString).replace(/\/mediaresources\/.*?\//g,"../presentation/media/").replace(/\http:\/\/.*?:8080/,"").replace(/\/themes\//,"http://www.bilimtek.com:8080/themes/");
    return htmlContent;
  };
  
  var getFile = function(fileUrl,callback)
  {
    var fileUrl = fileUrl.replace(/'|"/g,"").replace(/\http:\/\/.*?:8080/,"").replace(/\/themes\//,"http://www.bilimtek.com:8080/themes/");
    var filePath = "presentation" + fileUrl.replace(/\/mediaresources\/.*?\//,"/media/").replace(/\http:\/\/.*?:8080/,"").replace(/\/themes\//,"http://www.bilimtek.com:8080/themes/");
    var http = require('http');
    var fs = require('fs');
    if(fs.existsSync(filePath))
    {
      callback("");
      return;
    }

    var file = fs.createWriteStream(filePath);
    var request = http.get(url+fileUrl, function(response) {
      file.on("finish", function()
      {
        file.close();
        callback(response);
      });
      file.on('error', function(err) {
          console.log(err.message);
      });
      
      response.pipe(file);
    });
    
    request.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
  };
  
  var changeCssUrls = function(cssContent)
  {
    var regex = /(?:([\w&./\-]+)media\/)/gm;
    var replaceString = '../media/';
    cssContent = cssContent.replace(regex, replaceString);
    return cssContent;
  };
  
  var downloadCssMedia = function (cssContent,callback)
  {
    var regex = cssContent.match(/(?:([\/\-]+)media.*")/gm);
    if(regex)
    {
      var completedDownloads = 0;
      var numberOfCssMediaFiles = regex.length;
      for(var i = 0; i<numberOfCssMediaFiles;i++)
      {
        var fileUrl = regex[i].slice(0,-1);
        getFile(fileUrl,function(response)
        {
          completedDownloads++;
          if(numberOfCssMediaFiles===completedDownloads)
          {
            callback();
          }
        });
      }
    }
    else
    {
      callback();
    }
  };
  
  var saveCssToFile = function(cssContent,filePath)
  {
    var result = fileManager.writeToFile("presentation"+filePath,cssContent,false,true);      
  };
  
  var createDirectories = function(callback)
  {
    var numOfCreatedDirs = 0;
    for (key in directories){
      fileManager.ensureDirectoryExists(directories[key], 777, function(err) {
        if (err) 
        {
          console.log("alarm alarm: "+ err.message);
          return;
        }
        
        numOfCreatedDirs++;
        if(numOfCreatedDirs === Object.keys(directories).length)
        {
          callback();
        }
      });
    }
  };
  
  var mergeArrays = function(array1,array2)
  {
    for(var i = 0; i<array2.length;i++)
    {
      array1.push(array2[i]);
    }
    
    return array1;
  };
  
  var self =this;
}

$( document ).ready(function() 
{
  var playerManager = new PlayerManager();
  var playerInterval = setInterval(function(){
    playerManager.initializePlayer();
  },60000);
  
  playerManager.initializePlayer();
});
