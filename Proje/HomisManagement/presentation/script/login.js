
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
    var name = $("#name").val();
    var password = $("#password").val();
    var rememberMe = document.getElementById("remember").checked;
    var data = {name: name , password: password, rememberMe : rememberMe };
    
    $.ajax({
      type: "POST",
      url: url+"service/login",
      data: data,
      success: function(response){
        if(!response.accessToken)
        {
          BootstrapDialog.alert(response.message);
          return;
        }
        
        window.location.href = url+"manager.html";
      },
      error: function(error){debugger;}
    });
  });
  
  $(document).keyup(function (e) {
    if (e.keyCode == 13) 
    {
      $("#login").click();
    }
  });
}

$( document ).ready(function() 
{	 
  initializeLoginPage();
});
