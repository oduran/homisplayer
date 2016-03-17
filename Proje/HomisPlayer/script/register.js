var RegisterPlayer = function()
{
  var playerId="";
  var playerHardwareId = "";
  var url = Util.getWindowUrl();
  
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

    savePlayer();
    window.location = "player.html";
  };

  /** Playerın sisteme kaydolmasını sağlayan fonksiyon.
  */
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
