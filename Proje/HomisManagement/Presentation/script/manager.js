var url = Util.getWindowUrl();
  var data = { accessToken:"5"};
  alert(document.cookie.toString());
  $.ajax({
    type: "POST",
    url: url+"service/getuser",
    data: data,
    success: function(data)
    { debugger;
      if(data.user.type=="admin")
      {
       $("#workspaces").css("width","35.333333%")
       $("#players").css("width","35.333333%")
       $("#adminPanel").css("display","block"); 
      }
      for(var i = 0 ;i<data.user.workspaces.length; i++)
      {
        var workspaceName = "<li><a href='#'>Çalışma Alanı " + (i+1)+"<button class='btn btn-info' id="+data.user.workspaces[i].workspaceId+" onclick='showWorkspaceById("+data.user.workspaces[i].workspaceId+")' style='float:right;margin-top:-5px'>Düzenle&nbsp;<span style='float:right' class='glyphicon glyphicon-edit'></span></button></a></li>";
        $('#workspaceList').append(workspaceName);  
      }
    },
    error: function(error){debugger;}
  });
  function showWorkspaceById(id)
  {
     window.location.href=url+"newScreen.html?workspaceId="+id;
  }
 