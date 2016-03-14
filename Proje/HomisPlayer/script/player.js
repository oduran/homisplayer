 
 var Player = function()
 {
  this.initializePlayerPage = function()
  {
    var fs = require('fs');
    if (fs.existsSync("my_file.txt"))
    {
      var playerId = readPlayerIdFromFile();
      getPlayer(playerId);
      return;
    }
  }
  
  var readPlayerIdFromFile = function ()
  { 
    var fs = require("fs");
    var fileContent = fs.readFileSync('my_file.txt');
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
          {debugger;
            for (var j = 0 ; j<workspace.walls[i].screens.length;j++ )
            {
              var iframe = document.createElement("iframe");
              iframe.style.width = workspace.width/workspace.walls[i].screens.length+"px";
              iframe.style.height =workspace.height/ workspace.walls[i].screens.length+"px";
              iframe.srcdoc = workspace.walls[i].screens[j].html;
              playerDiv.appendChild(iframe);
            }
          }
          container[0].appendChild(playerDiv);
        }
        
        for(var k = 0 ; k<$(".container div iframe").length;k++)
        {
            checkContentFunction($(".container div iframe")[i].srcdoc);
        }
        
      },
      error: function(error){debugger;}
    });
  };
 
  var checkContentFunction = function(playerDiv)
  {
    checkCssFolder(playerDiv);
    checkScriptFolder(playerDiv);
    checkMedia(playerDiv);
  };
  
  var checkCssFolder = function(playerDiv)
  {
    var str = playerDiv; 
    //css regex
    var res = str.match(/\"([a-z1-9\/.]+)css"/g);
    for(var i = 0; i<res.length;i++)
    {
      getFileFromUrl(res[i].slice(1,-1));
    }
  }
  
  var checkScriptFolder = function(playerDiv)
  {
    var str = playerDiv; 
    //script regex
    var res = str.match(/\"([a-z1-9\/.]+)js"/g);
    for(var i = 0; i<res.length;i++)
    {
      getFileFromUrl(res[i].slice(1,-1));
    }
  }
  
  var checkMedia = function(playerDiv)
  {
    var str = playerDiv; 
    //media regex
    var res = str.match(/\"([a-z1-9\/.]+(png|jpeg|mp4|jpg|webm))"/g);
    for(var i = 0; i<res.length;i++)
    {
      getFileFromUrl(res[i].slice(1,-1));
    }
  }
  
  var getFileFromUrl = function(res)
  {
    var cssurl = "http://localhost:8080/"+res;
    
    var jsonFile = new XMLHttpRequest();
        jsonFile.open("GET",cssurl,true);
        jsonFile.send();

        jsonFile.onreadystatechange = function()
        {
          if (jsonFile.readyState== 4 && jsonFile.status == 200)
          {
            console.log(jsonFile.responseText);
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
