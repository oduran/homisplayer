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
        if(response.message)
        {
          Util.deleteCookie("accessToken");
          window.location.href = url+"login.html";
          return;
        }
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
      //    var $html = $('<div id="MainMenu"><div class="list-group panel"><a href="#demo3" class="list-group-item list-group-item-success" data-toggle="collapse" data-parent="#MainMenu">Item 3</a><div class="collapse" id="demo3">href="#SubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubMenu1">Subitem 1 <i class="fa fa-caret-down"></i></a>     <div class="collapse list-group-submenu" id="SubMenu1">        <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 1 a</a>        <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 2 b</a>        <a href="#SubSubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubSubMenu1">Subitem 3 c <i class="fa fa-caret-down"></i></a>        <div class="collapse list-group-submenu list-group-submenu-1" id="SubSubMenu1">          <a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 1</a>          <a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 2</a>        </div>        <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 4 d</a>      </div>      <a href="javascript:;" class="list-group-item">Subitem 2</a>      <a href="javascript:;" class="list-group-item">Subitem 3</a>    </div>    <a href="#demo4" class="list-group-item list-group-item-success" data-toggle="collapse" data-parent="#MainMenu">Item 4</a>    <div class="collapse" id="demo4">      <a href="" class="list-group-item">Subitem 1</a>      <a href="" class="list-group-item">Subitem 2</a>      <a href="" class="list-group-item">Subitem 3</a>    </div>  </div></div>');
          var userList = "<a class='list-group-item' id='"+response[i].name+"' href='#' onclick='return getWorkspaceById("+response[i].name+");' >"+ response[i].name+" "+ response[i].surname+"<button class='btn btn-danger' onclick=deleteUser('"+response[i].name+"') style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-trash'></span></button><button class='btn btn-info accordion-toggle' data-toggle='collapse' href='#"+response[i]._id+"' style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-edit'></span></button><div id='"+response[i]._id+"' class='collapse'><form class ='"+response[i]._id+"'><fieldset><div class='form-group'><label>Kullanıcı Adı</label><input type='text' class='form-control formelement name' name='name' placeholder='Kullanıcı Adı' value="+response[i].name+"><label>Soyadı</label><input type='text' class='form-control formelement surname' name='surname' placeholder='Soyadı' value="+response[i].surname+"><label>Email</label><input type='text' class='form-control formelement email' name='email' placeholder='Email' value="+response[i].email+"><button class='btn btn-success' onclick=editUserById('"+response[i]._id+"') style='float:right'><span style='float:right' class='glyphicon glyphicon-saved'></span></button></div></fieldset></form></div></a>";
          $('#userList').append(userList);  
        }
      },
      error: function(error){debugger;}
    });
    
  }
  function deleteUser(name)
  { 
    var data = {accessToken:accessToken,name : name};
    $.ajax({
    type: "POST",
    url: url+"service/deleteuser",
    data: data,
    success: function(response)
    { debugger;
      $('#userList').empty();
      getUserList();      
    },
    error: function(error){debugger;}
    });  
  }
  function getWorkspaceById(name)
  {
    $("#workspaceList").empty();
    var data = { accessToken:accessToken, name:name.id};
    $.ajax({
    type: "POST",
    url: url+"service/getuser",
    data: data,
    success: function(response)
    { debugger;
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
  function editUserById(id)
  {
    var name="";
    var surname="";
    var email="";
    var inputs = id.elements;
    $('.'+id+' input' ).each(function() 
    {
        if($(this).attr('name')==="name")
        {
          name = $(this).val();   
        }
        if($(this).attr('name')==="surname")
        {
          surname = $(this).val();   
        }
        if($(this).attr('name')==="email")
        {
          email = $(this).val();   
        }
     
    });
  
    var data = {accessToken:accessToken, user: {"name":name,"surname":surname,"type":"admin","email":email,"workspaces":[]}};
    $.ajax({
      type: "POST",
      url: url+"service/saveuser",
      data: data,
      success: function(data){debugger;},
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
  var addCreateNewUser = function ()
  {
    $("#createNewUser").click(function()
    {
      $("#createUserModal").modal("show");
      $("#name").focusout(
        function (event) 
        {
          var name = $("#name").val();
          checkUser(name);
        });
    });
  }
  function checkUser(name)
  {console.log(name);
    var data = { accessToken:accessToken,name:name};
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
       var data = {user: {
                         "name":$("#name").val(),
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
 