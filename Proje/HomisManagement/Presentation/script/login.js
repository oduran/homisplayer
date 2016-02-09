
var addLoginOnClick = function (){
  var url = Util.getWindowUrl();
  $("#login").click(function ()
  
  {debugger;
    var username = $("#username").val();
    var userpassword = $("#password").val();
    var data = {username: username , password: userpassword };
    $.ajax({
      type: "POST",
      url: url+"service/login",
      data: data,
      success: function(response){
        window.location.href = url+"main.html";
      },
      error: function(error){debugger;}
    });
  });
}
$( document ).ready(function() 
{	 
  addLoginOnClick();
});
