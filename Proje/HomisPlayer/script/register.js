var RegisterPlayer = function()
{
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
        
      },
      error: function(error){debugger;}
    });
  });
  };
  var self =this;
}

$( document ).ready(function() 
{
  var registerplayer = new RegisterPlayer();
  registerplayer.initializeRegisterPage();
});
