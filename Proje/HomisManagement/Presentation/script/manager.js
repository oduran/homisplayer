  var url = Util.getWindowUrl();
  var accessToken = Util.getCookieValue("accessToken");
 
  
  var getWorkspaces = function (accessToken)
  {
    if(!accessToken)
    {debugger;
      window.location.href = url+"login.html";
      return;
    }
    
    var data = { accessToken:accessToken};
    $.ajax({
      type: "POST",
      url: url+"service/getuser",
      data: data,
      success: function(data)
      { 
        if(data.user.type=="admin")
        {
         $("#workspaces").css("width","35.333333%")
         $("#players").css("width","35.333333%")
         $("#adminPanel").css("display","block"); 
        }
        
        if(!data.user.workspaces)
        {
          return;
        }
        
        for(var i = 0 ;i<data.user.workspaces.length; i++)
        {
          var workspaceName = "<a class='list-group-item' href='#'>Çalışma Alanı " + (i+1)+"<button class='btn btn-danger' style='float:right;margin-top:-7px'>Sil&nbsp;<span style='float:right' class='glyphicon glyphicon-remove'></span></button><button class='btn btn-info' id='"+data.user.workspaces[i].workspaceId+"' onclick=showWorkspaceById('"+data.user.workspaces[i].workspaceId+"') style='float:right;margin-top:-7px'>Düzenle&nbsp;<span style='float:right' class='glyphicon glyphicon-edit'></span></button></a>";
          $('#workspaceList').append(workspaceName);  
        }
      },
      error: function(error){debugger;}
    });
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
  
  var addLogoutButtonClick = function()
  {
    $("#logoutButton").click(function()
    {
      Util.deleteCookie("accessToken");
      window.location.href=url+"login.html";
    });
  }
  
  $( document ).ready(function() 
  {	 
    getWorkspaces(accessToken);
    addNewWorkspace();
    addLogoutButtonClick();
  });
 