 
 var Player = function()
 {
  var url = "http://www.bilimtek.com:8080";
  url = "http://192.168.2.8:8080";
  var fileManager = new FileManager();
  var downloading = false;
  var directories =
  {
    presentation : "presentation",
    css : "presentation/css",
    script : "presentation/script",
    media : "presentation/media",
    font : "presentation/media/font",
    weather : "presentation/media/weatherimages",
    public : "presentation/public"
  };
  
  this.initializePlayerPage = function()
  {
    if(downloading)
    {
      return;
    }
    
    var playerId = getPlayerId();
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
  };
  
  var showWorkspace = function(player)
  { 
    var workspace = player.workspace;
    if(workspace)
    { 
      var container = document.getElementsByClassName('bilimtekcontainer');
      var playerDiv = document.createElement("div");
      playerDiv.style.width = workspace.width+"px";
      playerDiv.style.height = workspace.height+"px";
      var walls = workspace.walls;
      var startTime = workspace.starttime;
      var endTime = workspace.endtime;
      var timeDifference = calculateTimeDifference(startTime,endTime);
      var totalSpentTime = 0;
      var i=0;
      var showTime;
      var setScreenTimeoutWalls = function()
      {
        var newWall = walls[i];
        showTime = newWall.showTime;
        var checkDeterminedTimeInterval = setInterval(function()
        {
          for(var i = 0 ;i<walls.length;i++)
          {
              if(walls[i].showTime.indexOf("-")>0)
              { 
                self.date = new Date();
                var start=walls[i].showTime.split("-")[0];
                var end=walls[i].showTime.split("-")[1];
                var dateOfScreen = stringToDate(start);
                 
                if(self.date.getHours()===dateOfScreen.getHours()&&
                  self.date.getMinutes()===dateOfScreen.getMinutes()&&
                  self.date.getSeconds()-dateOfScreen.getSeconds()<2)
                {
                 var counter = calculateTimeDifference(start,end); 
                 playerDiv = setPlayerWalls(workspace,walls[i],playerDiv);
                 container[0].innerHTML = "";
                 container[0].appendChild(playerDiv);
                 setTimeout(setScreenTimeoutWalls, counter[0]*1000*60);
                }
              }
          }
        }, 1000);
        
        totalSpentTime += parseInt(newWall.showTime);
        playerDiv = setPlayerWalls(workspace,newWall,playerDiv);
        container[0].innerHTML = "";
        container[0].appendChild(playerDiv);
        i++;

        if(workspace.walls.length===i)
        {
          i=0;
        }

        if(timeDifference[0]<=totalSpentTime)
        {
          totalSpentTime=0;
        }

        setTimeout(setScreenTimeoutWalls, newWall.showTime*1000*60);
       }
     
       setTimeout(setScreenTimeoutWalls,2000);
    }
  };
  
  var setPlayerWalls = function (workspace,wall,playerDiv)
  {
    for (var j = 0 ; j<wall.screens.length;j++ )
    { 
      var iframe = document.createElement("iframe");
      iframe.style.width = workspace.width/wall.screens.length+"px";
      iframe.style.height = workspace.height+"px";
      iframe.style.border = "0px";
      var htmlDoc = wall.screens[j].html;
      
      if(htmlDoc.indexOf("http")===0)
      {
        iframe.src = htmlDoc;
        playerDiv.appendChild(iframe);
      }
      else
      {
        iframe.srcdoc = "<!DOCTYPE HTML>"+htmlDoc;
        playerDiv.appendChild(iframe);
      }
    }
    
    return playerDiv;
  }
  
  var getPlayerId = function()
  {
    var fileContent = "";
    fileContent = fileManager.getFile("playerId.txt");
    return fileContent;
  };
  
  var getPlayerSuccess = function(response)
  {
    var player = response.player;
    var previousPlayerFile = getPlayerFromFile();
    if(!deepEquals(previousPlayerFile,player))
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
  };
  
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
            downloading = false;
            showWorkspace(player);  
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
      success: callback,
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
  
  var deepEquals = function(player1,player2)
  {
    return JSON.stringify(player1)=== JSON.stringify(player2);
  };
  
  var getFileUrls = function(htmlContent)
  {
    var fileUrls=[];
    var regex = /(href=|src=)\"(.*)(\.css|\.js|\.webm|\.jpeg|\.jpg|\.png)"/g;
    var result = htmlContent.match(regex);
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
    var htmlContent = htmlContent.replace(regex, replaceString).replace(/\/mediaresources\/.*?\//,"../presentation/media/");
    return htmlContent;
  };
  
  var getFile = function(fileUrl,callback)
  {
    var filePath = "presentation" + fileUrl.replace(/\/mediaresources\/.*?\//,"/media/");
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
        }
        numOfCreatedDirs++;
        if(numOfCreatedDirs === Object.keys(directories).length)
        {
          callback();
        }
      });
    }
  };
  
  var calculateTimeDifference = function(startTime,endTime)
  {
    var time1 = startTime.split(':');
    var time2 = endTime.split(':');
    var startHour = parseInt(time1[0], 10); 
    var endHour = parseInt(time2[0], 10);
    var startMin = parseInt(time1[1], 10);
    var endMin = parseInt(time2[1], 10);
    var hours = endHour - startHour, mins = 0;
    if(hours < 0) hours = 24 + hours;
    if(endMin >= startMin) {
       mins = endMin - startMin;
    }
    else {
       mins = (endMin + 60) - startMin;
       hours--;
    }
    mins = mins / 60; // take percentage in 60
    hours += mins;
    return [hours*60,startHour,startMin,endHour,endMin];
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
  var player = new Player();
  var playerInterval = setInterval(function(){
    player.initializePlayerPage();
  },60000);
  
  player.initializePlayerPage();
});
