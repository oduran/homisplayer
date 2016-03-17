 
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
          fileManager.deleteFile("player.txt");
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
          var container = document.getElementsByClassName('bilimtekcontainer');
          var playerDiv = document.createElement("div");
          playerDiv.style.width = workspace.width+"px";
          playerDiv.style.height = workspace.height+"px";
          for(var i = 0; i<workspace.walls.length;i++)
          {
            for (var j = 0 ; j<workspace.walls[i].screens.length;j++ )
            {
              var iframe = document.createElement("iframe");
              iframe.style.width = workspace.width/workspace.walls[i].screens.length+"px";
              iframe.style.height = workspace.height+"px";
              iframe.style.border = "0px";
              var htmlDoc = workspace.walls[i].screens[j].html;
              
              if(htmlDoc.indexOf("http")===0)
              {
                iframe.src = htmlDoc;
                playerDiv.appendChild(iframe);
              }
              
              else
              {
               iframe.srcdoc = workspace.walls[i].screens[j].html;  
               playerDiv.appendChild(iframe);
               for(var k = 0; k<regexType.length;k++)
                {
                  checkContentFunction(iframe.srcdoc,regexType[k]);  
                  iframe.srcdoc = changeElementsUrl(iframe.srcdoc,regexType[k]);
                }
              }
            }
          }
          container[0].innerHTML = "";
          container[0].appendChild(playerDiv);
        }
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
       regex = str.match(/src=\"(.*)(\.jpg|\.png|\.webm)"/g);
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
 
  var downloadHtmlMediaElements = function(path,source)
  {
    var http = require('http');
    var fs = require('fs');
    var file = fs.createWriteStream(path);
    var request = http.get("http://localhost:8080"+source, function(response) {
      console.log(response.statusCode+"  "+source);
      response.pipe(file);
    });
  }
  
  var writeTextToHeadLinks = function (path,source)
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
                downloadCssElements(result,function(result){
                 stream.write(result);
                 stream.end();
                });
             }
             stream.write(result);
             stream.end();
           }); 
          }
        }
  }
  
  var downloadCssElements = function (cssText,callback)
  {
     var str = cssText ;
     var regex = str.match(/(?:([\/\-]+)media.*")/gm);
     if(regex)
    {
      for(var i = 0; i<regex.length;i++)
      {
        var source = regex[i].slice(0,-1);
        var path = "presentation"+source;
        downloadHtmlMediaElements(path,source);
      }
      callback;
    }
  }
  
  var getFileFromUrl = function(source)
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
        downloadHtmlMediaElements(path,source);
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
