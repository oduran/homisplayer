
var initializeLoginPage = function ()
{
  var url = Util.getWindowUrl();
  var accessToken = Util.getCookieValue("accessToken")
  if(accessToken)
  {
    window.location.href = url+"manager.html";
   
  }
  
  $("#login").click(function ()
  {
    var username = $("#username").val();
    var password = $("#password").val();
    var rememberMe = document.getElementById("remember").checked;
    var data = {username: username , password: password, rememberMe : rememberMe };
    $.ajax({
      type: "POST",
      url: url+"service/login",
      data: data,
      success: function(response){
        if(!response.accessToken)
        {
          alert(response.message);
          return;
        }
        
        window.location.href = url+"manager.html";
      },
      error: function(error){debugger;}
    });
  });
}

$( document ).ready(function() 
{	 
  initializeLoginPage();
});
