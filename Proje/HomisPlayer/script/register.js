var RegisterPlayer = function()
{
  var playerHardwareId = ""; 
  var url = "http://www.bilimtek.com:8080";
    url = "http://localhost:8080";

  /** Sayfa açıldığında eğer player kaydı olmuşşsa playerı gösterir, olmadıysa pc nin mac adresini alır ve playerı kaydeder.
  */
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

    registerSavePlayerOnClick();
  };

  /** Playerın sisteme kaydolmasını sağlayan fonksiyon.
  */
  var registerSavePlayerOnClick = function ()
  {
    $("#savePlayer").click(function()
    {
      var playerName = $("#playerName").val();
      var playerState = "ready";
      var data = { playerName:playerName, playerHardwareId:playerHardwareId, playerState:playerState,playerLastSeen:(new Date()).toString()};
      $.ajax({
        type: "POST",
        url: url+"/service/registerplayer",
        data: data,
        success: function(response)
        {
          if(response.message)
          {
            BootstrapDialog.alert(response.message);
            return;
          }
          
          var playerId = response.playerId;
          if(playerId)
          {
            savePlayerIdToHarddisk(playerId);
          }
          
          window.location = "player.html";
        },
        error: function(error){}
      });
    });
  };

  /** Player id nin hardiske yazıldığı fonksiyon.
  *{param} {string} playerId - Oynatılacak playerın id sini tutar.
  */
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
