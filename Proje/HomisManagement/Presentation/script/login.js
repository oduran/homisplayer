
var addLoginOnClick = function (){
  var url = Util.getWindowUrl();
  $("#login").click(function ()
  {
    var username = $("#username").val();
    var userpassword = $("#password").val();
    var data = {username: username , password: userpassword };
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
  addLoginOnClick();
});
