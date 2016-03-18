 
 var Player = function()
 {
  var startTime ;
  var endTime ;
  var downloadComplete=false;
  this.date = new Date();
  var regexType = ["css","script","media"];
  var fs = require('fs');
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
      fileManager.ensureDirectoryExists(directories[key], 7777, function(err) {
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
    console.log(fileContent.toString());
    return fileContent.toString();
  }
  var getPlayer = function (playerId,callback)
  {
    var data = { playerId:playerId };
    $.ajax({
      type: "POST",
      url: "http://localhost:8080/service/getplayer",
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
      
      var walls = workspace.walls;
      var startTime = workspace.starttime;
      var endTime = workspace.endtime;
      var timeDifference = calculateTimeDifference(startTime,endTime);
      var totalSpentTime = 0;
      var i=0;
      var showTime;
      var setScreenTimeoutWalls = function()
      {
        var container = document.getElementsByClassName('bilimtekcontainer');
        var playerDiv = document.createElement("div");
        playerDiv.style.width = workspace.width+"px";
        playerDiv.style.height = workspace.height+"px";
        var newWall = walls[i];
        showTime = newWall.showTime;
        console.log(showTime);
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
     
       settimeoutscreen = setTimeout(setScreenTimeoutWalls,100);
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
    for (var j = 0 ; j<wall.screens.length;j++ )
    {
      var iframe = document.createElement("iframe");
      iframe.style.width = workspace.width/wall.screens.length+"px";
      iframe.style.height = workspace.height+"px";
      iframe.style.border = "0px";
      var htmlDoc = wall.screens[j].html;
      playerDiv.innerHTML ="";
      if(htmlDoc.indexOf("http")===0)
      {
        iframe.src = htmlDoc;
        playerDiv.appendChild(iframe);
      }
      
      else
      {
        iframe.srcdoc = htmlDoc; 
        var completedFileTypes =0;
        for(var k = 0; k<regexType.length;k++)
        {
          checkContentFunction(iframe.srcdoc,regexType[k],function(){
            completedFileTypes++;
            
            if(completedFileTypes===regexType.length)
            {
              for(var l = 0 ; l< regexType.length;l++)
              {
                iframe.srcdoc = changeElementsUrl(iframe.srcdoc,regexType[l]);
              }
              
              playerDiv.appendChild(iframe);
            }
          });  
        }
      }
    }
    return playerDiv;
  }
  
  var changeElementsUrl = function(playerDiv,regexType)
  {
    var str = playerDiv; 
    var regex;
    if(regexType==="script")
    {
      regex = /(?=([\w&./\-]+)script\/)/gm;
    }
    
    if(regexType==="css")
    {
      regex = /(?=([\w&./\-]+)css\/)/gm;
    }
    
    if(regexType==="media")
    {
      regex = /(?=([\w&./\-]+)media\/)/gm;
    }
    
    var replaceString = '../presentation';
    var result = str.replace(regex, replaceString);
    return result;
  }
   
  var checkContentFunction = function(playerDiv,regexType,callback)
  {
    var str = playerDiv; 
    var regex;
    var regexSliceNumber;
    if(regexType==="css")
    {
       regex = str.match(/href=\"(.+)css"/g);
       regexSliceNumber=6;
    }
    if(regexType==="script")
    {
       regex = str.match(/src=\"(.*)\.js"/g);
       regexSliceNumber=5;
    }
    if(regexType==="media")
    {
       regex = str.match(/src=\"(.*)(\.jpg|\.png|\.webm)"/g);
       regexSliceNumber=5;
    }
    if(regex)
    {
      for(var i = 0; i<regex.length;i++)
      {
        var fileUrl = regex[i].slice(regexSliceNumber,-1);
        getFileFromUrl(fileUrl,callback);
      }
    }
  };
 
  var downloadHtmlMediaElements = function(path,source,callback)
  {
    var http = require('http');
    var fs = require('fs');
    var file = fs.createWriteStream(path);
    var request = http.get("http://localhost:8080"+source, function(response) {
      response.pipe(file);
      callback(response);
    });
  }
  
  var writeTextToHeadLinks = function (path,source,callback)
  {
    var sourceUrl = "http://localhost:8080"+source;
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
	var playerRequestInterval=setInterval(function(){player.initializePlayerPage();},9000);
  player.initializePlayerPage();
});
