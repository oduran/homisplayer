  var url = Util.getWindowUrl();
  var accessToken = Util.getCookieValue("accessToken");
  var getWorkspaces = function (accessToken)
  {
    if(!accessToken)
    {
      window.location.href = url+"login.html";
      return;
    }
    
    var data = { accessToken:accessToken};
    $.ajax({
      type: "POST",
      url: url+"service/getuser",
      data: data,
      success: function(response)
      { 
        if(response.user.type=="admin")
        {
         $("#workspaces").css("width","35.333333%")
         $("#players").css("width","25.333333%")
         $("#adminPanel").css("display","block");
         $("#adminPanel").css("width","35.333333%"); 
         getUserList();
        }
        
        if(!response.user.workspaces)
        {
          return;
        }
        
        for(var i = 0 ;i<response.user.workspaces.length; i++)
        {
          var workspaceName = "<a class='list-group-item' href='#'>"+ response.user.workspaces[i].name+"<button class='btn btn-info' id='"+response.user.workspaces[i].workspaceId+"' onclick=showWorkspaceById('"+response.user.workspaces[i].workspaceId+"') style='float:right;margin-top:-7px'>Düzenle&nbsp;<span style='float:right' class='glyphicon glyphicon-edit'></span></button></a>";
          $('#workspaceList').append(workspaceName);  
        }
      },
      error: function(error){debugger;}
    });
  }
  function getUserList()
  {
    var data = { accessToken:accessToken};
    $.ajax({
      type: "POST",
      url: url+"service/getUsers",
      data: data,
      success: function(response)
      {   debugger;       
        for(var i = 0 ;i<response.length; i++)
        {
          var userList = "<a class='list-group-item' id='"+response[i]._id+"' href='#' onclick='return getWorkspaceById(this.id)'>"+ response[i].name+" "+ response[i].surname+"<button class='btn btn-danger' id='"+response[i]._id+"' onclick=deleteUserById('"+response[i]._id+"') style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-trash'></span></button><button class='btn btn-info' id='"+response[i]._id+"' onclick=showUserById('"+response[i]._id+"') style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-edit'></span></button></a>";
          $('#userList').append(userList);  
        }
      },
      error: function(error){debugger;}
    });
    
  }
  
  function getWorkspaceById(id)
  {
     $("#workspaces").empty();
     
     alert(id);     
  }
  function showWorkspaceById(id)
  {
     window.location.href=url+"workspace.html?workspaceId="+id;
  }
  var addNewWorkspace = function()
  {
    $("#addNewWorkspace").click(function()
    {
      window.location.href=url+"workspace.html";
    });
  }
  var addCreateNewUser = function ()
  {
    $("#createNewUser").click(function()
    {
      $("#createUserModal").modal("show");
      $("#username").focusout(
        function (event) 
        {
          var username = $("#username").val();
           checkUser(username);
        });
    });
  }
  function checkUser(username)
  {console.log(username);
    var data = { accessToken:accessToken,username:username};
    $.ajax({
      type: "POST",
      url: url+"service/getuser",
      data: data,
      success: function(response){debugger;},
      error: function(error){debugger;}
    });
  }
  var addLogoutButtonOnClick = function()
  {
    $("#logoutButton").click(function()
    {
      Util.deleteCookie("accessToken");
      window.location.href=url;
    });
  }
  
  var addSaveUserButtonOnClick = function()
  {
    $(".createUser").click(function()
    {
      debugger;
      var data = {user: {
                         "name":$("#username").val(),
                         "surname":$("#surname").val(),
                         "email":$("#email").val(),
                         "phone":$("#phone").val(),
                         "password":$("#password").val(),
                         "type":$("#type").val(),
                         "workspaces":[],
                         "players":[],
                         "mediaResources":[]
                         }};
      $.ajax({
        type: "POST",
        url: url+"service/saveuser",
        data: data,
        success: function(response){debugger;},
        error: function(error){debugger;}
      });
    
    })
  }
  
  $( document ).ready(function() 
  {	 
    getWorkspaces(accessToken);
    addNewWorkspace();
    addCreateNewUser();
    addSaveUserButtonOnClick();
    addLogoutButtonOnClick();
  });
 