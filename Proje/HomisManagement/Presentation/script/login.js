
var addLoginOnClick = function (){
  $("#login").click(function ()
  
  {debugger;
    var username = $("#username").val();
    var userpassword = $("#password").val();
    var data = {username: username , password: userpassword };
    $.ajax({
      type: "POST",
      url: "http://www.homisida.com:8080/service/login",
      data: data,
      success: function(response){
        window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf('/') +1)+"main.html";
      },
      error: function(error){debugger;}
    });
  });
}
$( document ).ready(function() 
{	 
  addLoginOnClick();
});