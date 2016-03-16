var RegisterPlayer = function()
{
  var playerId="";
  var playerHardwareId = "";
  var url = Util.getWindowUrl();
  this.initializeRegisterPage = function ()
  {
    Util.loadingDialog.show();
    require('getmac').getMac(function(err,macAddress){
      if (err)  throw err
      playerHardwareId = macAddress;
      Util.loadingDialog.hide();
    });

    var fs = require('fs');
    if (fs.existsSync("playerId.txt"))
    {
     window.location = "player.html";
      return;
    }

    savePlayer();
  }

 
  
  var savePlayer = function ()
  {
  $("#savePlayer").click(function()
  {
    var playerName = $("#playerName").val();
    var data = { playerName:playerName, playerHardwareId:playerHardwareId};
    $.ajax({
      type: "POST",
      url: "http://localhost:8080/service/registerplayer",
      data: data,
      success: function(response)
      {
        playerId = response.playerId;
        if(playerId)
        {
          savePlayerIdToHarddisk(playerId);
          return;
        }
        
        BootstrapDialog.alert(response.message);
      },
      error: function(error){debugger;}
    });
  });
  };
  
 
  
  var savePlayerIdToHarddisk = function (playerId)
  {
   var fs = require('fs');
   var stream = fs.createWriteStream("playerId.txt");
   stream.once('open', function(fd)
    {
      stream.write(playerId);
      stream.end();
    }); 
  };
  
  
  var self =this;
}

$( document ).ready(function() 
{
  var registerplayer = new RegisterPlayer();
  registerplayer.initializeRegisterPage();
});
