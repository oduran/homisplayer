 
 var Player = function()
 {
  var startTime ;
  var endTime ;
  var downloading = false ;
  var noInternet = false ;
  var downloadComplete=false;
  this.date = new Date();
  var fs = require('fs');
  var url = "http://www.bilimtek.com:8080";
  var fileManager = new FileManager();
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
    if (fs.existsSync("playerId.txt"))
    {
      createDirectories();
      var playerId = readPlayerIdFromFile();
      var playerFromFile = getPlayerFromFile();
      getPlayer(playerId,function(response)
      {
        var playerFromService = response.player;
        var containerContent = $(".bilimtekcontainer").html().replace(/\s/g, '').replace(/\n/g,'');
        if(!deepEquals(playerFromFile,playerFromService) || containerContent === "")
        {  
          Util.loadingDialog.show();
          showWorkspace(playerFromService);
          if(fs.existsSync("player.txt"))
          {
            fileManager.deleteFile("player.txt");
          }
          
          savePlayerToFile(playerFromService);
        }
      });
    }
  }
  
  var createDirectories = function()
  {
    for (key in directories){
      fileManager.ensureDirectoryExists(directories[key], 777, function(err) {
        if (err) 
        {
          console.log("alarm alarm: "+ err.message);
        }
      });
    }
  }

  var readPlayerIdFromFile = function ()
  { 
    var fs = require("fs");
    var fileContent = fs.readFileSync('playerId.txt');
    return fileContent.toString();
  }
  
  var getPlayer = function (playerId,callback)
  {
    if(downloading||noInternet)
    {
      return;
    }
    
    var data = { playerId:playerId };
    $.ajax({
      type: "POST",
      url: url+"/service/getplayer",
      data: data,
      success: callback,
      error: function(error){}
    });
  };
  
  var showWorkspace = function(player)
  { 
    var workspace = player.workspace;
    if(workspace)
    { 
      var containerContent = $(".bilimtekcontainer").html().replace(/\s/g, '').replace(/\n/g,'');
      if(containerContent!=="")
      {
        location.reload();
      }
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
  
  var stringToDate = function(dateString)
  {
    var splittedTime = dateString.split(":");
    var hour = splittedTime[0];
    var minute = splittedTime[1];
    var time = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),hour,minute,0);
    return time;
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
  
  var setPlayerWalls = function (workspace,wall,playerDiv)
  {
    var completedScreens=0;
    for (var j = 0 ; j<wall.screens.length;j++ )
    { 
      debugger;
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

        downloading=true;
        checkContentFunction(htmlDoc,function(response)
        {
          completedScreens++;
          var contentString = htmlDoc;
          contentString = changeElementsUrl(contentString);
          fileManager.writeToFile("player.html","<!DOCTYPE HTML>"+contentString);
          iframe.srcdoc = "<!DOCTYPE HTML>"+contentString;
          playerDiv.appendChild(iframe);
          if(completedScreens===wall.screens.length)
          {
            downloading=false;          
          }
        });  
      }
    }
    return playerDiv;
  }
  
  var changeElementsUrl = function(playerDiv)
  {
    var str = playerDiv; 
    var regex = (/(?=([\w&./\-]+)script\/)/gm)|(/(?=([\w&./\-]+)css\/)/gm)|(/(?=([\w&./\-]+)media\/)/gm);
    var replaceString = '../presentation';
    var result = str.replace(regex, replaceString);
    return result;
  }
   
  var checkContentFunction = function(playerDiv,callback)
  {
    var str = playerDiv; 
    var regexSliceNumber;
    var test = /href=\"(.+)css"/g|/src=\"(.*)\.js"/g|/src=\"(.*)(\.jpg|\.png|\.webm)"/g;
    var regex = str.match(test);
    var completedFiles =0;
    if(regex)
    {
      for(var i = 0; i<regex.length;i++)
      {
        var fileUrl = regex[i].replace("href=","").replace("src=","");
        getFileFromUrl(fileUrl,function(response){
          completedFiles++;
          if(completedFiles===regex.length)
          {
            callback(response);
          }
        });
      }
    }
  };
 
  var downloadHtmlMediaElements = function(path,source,callback)
  {
    var response;
    var http = require('http');
    debugger;
    var fs = require('fs');
    if(fs.existsSync(path))
    {
      callback();
    }
    else
    {
      var file = fs.createWriteStream(path);
     
      var request = http.get(url+source, function(response) {
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
    }
   
    
  }
  
  var writeTextToHeadLinks = function (path,source,callback)
  {
    var sourceUrl = url+source;
    var xhr = new XMLHttpRequest();
        xhr.open("GET",sourceUrl,true);
        xhr.send();
        xhr.onreadystatechange = function()
        {
          if (xhr.readyState== 4 && xhr.status == 200)
          {
           var stream = fs.createWriteStream(path);
           stream.once('open', function(fd)
           {
             var result = xhr.responseText;
             if(sourceUrl.indexOf("css")>0)
             {  
                var str = xhr.responseText;
                var regex = /(?:([\w&./\-]+)media\/)/gm;
                var replaceString = '../media/';
                result = str.replace(regex, replaceString);
                downloadCssElements(result,function(){
                  stream.write(result);
                  stream.end();
                });
             }
             else
             {
               stream.write(result);
               stream.end();
             }
           }); 
          }
        }
  }
  
  var downloadCssElements = function (cssText,callback)
  {
     var regex = cssText.match(/(?:([\/\-]+)media.*")/gm);
     if(regex)
      {
        var completedDownloads = 0;
        var numberOfCssMediaFiles = regex.length;
        for(var i = 0; i<numberOfCssMediaFiles;i++)
        {
          var source = regex[i].slice(0,-1);
          var path = "presentation"+source;
          downloadHtmlMediaElements(path,source,function(response)
          {
            completedDownloads++;
            if(numberOfCssMediaFiles===completedDownloads)
            {
              callback();
            }
          });
        }
    }
  }
  
  var getFileFromUrl = function(source,callback)
  { 
    var splitSource = source.split("/")[2];
    var fs = require('fs');
    var path = "";
    if(splitSource)
    {
     if(splitSource.indexOf("css")>0)
     {
       path="presentation/css/"+splitSource;
     }
     
     if(splitSource.indexOf("js")>0)
     {
       path="presentation/script/"+splitSource;
     }
     
     if(splitSource.indexOf("webm")>0||
        splitSource.indexOf("jpg")>0||
        splitSource.indexOf("png")>0||
        splitSource.indexOf("ttf")>0||
        splitSource.indexOf("woff")>0)
     {
        path="presentation/media/"+splitSource;
        downloadHtmlMediaElements(path,source,callback);
        return;
     }
    }
    
    if (fs.existsSync(path))
    {
      return;
    }
    
    writeTextToHeadLinks(path,source);
  }
  
  var deepEquals = function(o1, o2) {
    return JSON.stringify(o1)=== JSON.stringify(o2);
  }
  
  var getPlayerFromFile = function()
  {
    var result = fileManager.loadFileToJson("player.txt");
    return result;
  };
 
  var savePlayerToFile = function(player)
  {
    fileManager.writeToFile("player.txt",JSON.stringify(player));
  }
  
  var self =this;
}

$( document ).ready(function() 
{
  var player = new Player();
	var playerRequestInterval=setInterval(function(){player.initializePlayerPage();},30000);
  player.initializePlayerPage();
});
