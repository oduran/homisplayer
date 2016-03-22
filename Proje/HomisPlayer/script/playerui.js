 var PlayerUI = function()
 {
  var timeouts = [];
  var intervals = []; 
   
  this.showWorkspace = function(player)
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
          for(var i = 0; i< intervals.length; i++)
          {
            clearInterval(intervals[i]);
          }
          
          intervals = [];
          intervals.push(checkDeterminedTimeInterval);
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

        var timeoutId = setTimeout(setScreenTimeoutWalls, newWall.showTime*1000*60);
        timeouts.push(timeoutId);
      }
      for(var i = 0 ; i<timeouts.length;i++)
      {
        clearTimeout(timeouts[i]);
      }
      
      timeouts = [];
      var timeoutId = setTimeout(setScreenTimeoutWalls,2000);
      timeouts.push(timeoutId);
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
 }