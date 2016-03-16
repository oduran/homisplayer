 
 var Player = function()
 {
   
  var regexType = ["css","script","media"];
  var fs = require('fs');
  var fileManager = new FileManager();
  var directories =
  {
    presentation : "presentation",
    css : "presentation/css",
    script : "presentation/script",
    media : "presentation/media",
    public : "presentation/public"
  };
   
  this.initializePlayerPage = function()
  {

    if (fs.existsSync("playerId.txt"))
    {
      createDirectories();
      var playerId = readPlayerIdFromFile();
      getPlayer(playerId);
      return;
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
  var getPlayer = function (playerId)
  {
    var data = { playerId:playerId };
    $.ajax({
      type: "POST",
      url: "http://localhost:8080/service/getplayer",
      data: data,
      success: function(response)
      {
        var workspace = response.player.workspace;
        if(workspace)
        {
          var container = document.getElementsByClassName('container');
          var playerDiv = document.createElement("div");
          playerDiv.style.width = workspace.width+"px";
          playerDiv.style.height = workspace.height+"px";
          for(var i = 0; i<workspace.walls.length;i++)
          {
            for (var j = 0 ; j<workspace.walls[i].screens.length;j++ )
            {
              var iframe = document.createElement("iframe");
              iframe.style.width = workspace.width/workspace.walls[i].screens.length+"px";
              iframe.style.height =workspace.height;
              iframe.srcdoc = workspace.walls[i].screens[j].html;
              playerDiv.appendChild(iframe);
              for(var k = 0; k<regexType.length;k++)
              {
                checkContentFunction(iframe.srcdoc,regexType[k]);  
              }
              
              iframe.srcdoc = changeCss(iframe.srcdoc);
              iframe.srcdoc = changeScript(iframe.srcdoc);
              iframe.srcdoc = changeMedia(iframe.srcdoc);
            }
          }
          container[0].appendChild(playerDiv);
        }

      },
      error: function(error){}
    });
  };
  
  var changeScript = function(playerDiv)
  {
    var str = playerDiv; 
    var regex = /(?=([\w&./\-]+)script\/)/gm;
    var replaceString = '../presentation';
    var result = str.replace(regex, replaceString);
    return result;
  }
  
  var changeCss = function(playerDiv)
  {
    var str = playerDiv; 
    var regex = /(?=([\w&./\-]+)css\/)/gm;
    var replaceString = '../presentation';
    var result = str.replace(regex, replaceString);
    return result;
  }
  
  var changeMedia = function(playerDiv)
  {
    var str = playerDiv; 
    var regex = /(?=([\w&./\-]+)media\/)/gm;
    var replaceString = '../presentation';
    var result = str.replace(regex, replaceString);
    return result;
  }
  
  var checkContentFunction = function(playerDiv,regexType)
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
       regex = str.match(/src=\"(.*)(\.jpg|\.webm)"/g);
       regexSliceNumber=5;
    }
    if(regex)
    {
      for(var i = 0; i<regex.length;i++)
      {
        getFileFromUrl(regex[i].slice(regexSliceNumber,-1));
      }
    }
  };
 
  var getFileFromUrl = function(res)
  { 
    var splitRes = res.split("/")[2];
    var fs = require('fs');
    var path = "";
    if(splitRes)
    {
     if(splitRes.indexOf("css")>0)
     {
       path="presentation/css/"+splitRes;
     }
     
     if(splitRes.indexOf("js")>0)
     {
       path="presentation/script/"+splitRes;
     }
     
     if(splitRes.indexOf("webm")>0||splitRes.indexOf("jpg")>0)
     {
       path="presentation/media/"+splitRes;
       
        var http = require('http');
        var fs = require('fs');

        var file = fs.createWriteStream(path);
        var request = http.get("http://localhost:8080"+res, function(response) {
          console.log(response.statusCode+"  "+res);
          response.pipe(file);
        });
        return;
     }
    }
    if (fs.existsSync(path))
    {
      return;
    }
    var cssurl = "http://localhost:8080"+res;
    var jsonFile = new XMLHttpRequest();
        jsonFile.open("GET",cssurl,true);
        jsonFile.send();
        jsonFile.onreadystatechange = function()
        {
          if (jsonFile.readyState== 4 && jsonFile.status == 200)
          {
           var stream = fs.createWriteStream(path);
           stream.once('open', function(fd)
           {
             stream.write(jsonFile.responseText);
             stream.end();
           }); 
          }
        }
  }
  var self =this;
}

$( document ).ready(function() 
{
  var player = new Player();
  player.initializePlayerPage();
});
