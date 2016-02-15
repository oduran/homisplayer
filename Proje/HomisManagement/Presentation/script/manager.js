  var url = Util.getWindowUrl();
  var accessToken = Util.getCookieValue("accessToken");
  var users = [];
  var adminControl=false;
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
      { debugger;
        if(response.message)
        {
          Util.deleteCookie("accessToken");
          window.location.href = url+"login.html";
          return;
        }
        if(response.user.type=="admin")
        {
          adminControl=true;
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
          var workspaceName = "<a class='list-group-item' href='#'>"
          + response.user.workspaces[i].name+
          "<button class='btn btn-info' id='"
          +response.user.workspaces[i].workspaceId+
          "' onclick=showWorkspaceById('"+response.user.workspaces[i].workspaceId+"') style='float:right;margin-top:-7px'>Düzenle&nbsp;<span style='float:right' class='glyphicon glyphicon-edit'></span></button></a>";
          $('#workspaceList').append(workspaceName);  
        }
      },
      error: function(error){debugger;}
    });
  }
  
  function getUserList()
  {
    $('#userList').empty();
    var data = { accessToken:accessToken};
    $.ajax({
      type: "POST",
      url: url+"service/getUsers",
      data: data,
      success: function(response)
      {   debugger;     
        users = response;      
        for(var i = 0 ;i<response.length; i++)
        {
          var user = response[i];
      //    var $html = $('<div id="MainMenu"><div class="list-group panel"><a href="#demo3" class="list-group-item list-group-item-success" data-toggle="collapse" data-parent="#MainMenu">Item 3</a><div class="collapse" id="demo3">href="#SubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubMenu1">Subitem 1 <i class="fa fa-caret-down"></i></a>     <div class="collapse list-group-submenu" id="SubMenu1">        <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 1 a</a>        <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 2 b</a>        <a href="#SubSubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubSubMenu1">Subitem 3 c <i class="fa fa-caret-down"></i></a>        <div class="collapse list-group-submenu list-group-submenu-1" id="SubSubMenu1">          <a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 1</a>          <a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 2</a>        </div>        <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 4 d</a>      </div>      <a href="javascript:;" class="list-group-item">Subitem 2</a>      <a href="javascript:;" class="list-group-item">Subitem 3</a>    </div>    <a href="#demo4" class="list-group-item list-group-item-success" data-toggle="collapse" data-parent="#MainMenu">Item 4</a>    <div class="collapse" id="demo4">      <a href="" class="list-group-item">Subitem 1</a>      <a href="" class="list-group-item">Subitem 2</a>      <a href="" class="list-group-item">Subitem 3</a>    </div>  </div></div>');
          var userList = "<a class='list-group-item' href='#' id='"+user.name+
          "'>"+ user.name+"<button class='btn btn-danger' onclick=deleteUser('"
          +user.name+"') style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-trash'></span></button><button class='btn btn-info accordion-toggle' data-toggle='collapse' href='#"+
          user._id+"' onclick='getWorkspacesByUsername("+
          user.name+");' style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-edit'></span></button><div id='"+
          user._id+"' class='collapse'><form class ='"+
          user._id+"'><fieldset><div class='form-group'><label>Kullanıcı Adı</label><input type='text' class='form-control formelement name' name='name' placeholder='Kullanıcı Adı' value="+
          user.name+"><label>Soyadı</label><input type='text' class='form-control formelement surname' name='surname' placeholder='Soyadı' value="
          +user.surname+"><label>Email</label><input type='text' class='form-control formelement email' name='email' placeholder='Email' value="+
          user.email+"><button class='btn btn-success' onclick=editUserById('"+user._id+"') style='float:right'><span style='float:right' class='glyphicon glyphicon-saved'></span></button></div></fieldset></form></div></a><input id='userId' value="+user._id+"/>";
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
    {
      $('#userList').empty();
      getUserList();      
    },
    error: function(error){debugger;}
    });  
  }
  
  function getWorkspacesByUsername(name)
  {
    
    $("#workspaceList").empty();
    var data = { accessToken:accessToken, name:name.id};
    $.ajax({
    type: "POST",
    url: url+"service/getuser",
    data: data,
    success: function(response)
    {
      if(!response.user.workspaces)
      {
        return;
      }
      
      for(var i = 0 ;i<response.user.workspaces.length; i++)
      {
        var workspaceId = response.user.workspaces[i].workspaceId;
        var userId = response.user._id;
        $("#userId").val(userId);
        var workspaceName = "<a class='list-group-item' href='#'>"+ response.user.workspaces[i].name+"<button class='btn btn-info' id='"+response.user.workspaces[i].workspaceId+"' onclick=showWorkspaceById('"+workspaceId+"-"+userId+"') style='float:right;margin-top:-7px'>Düzenle&nbsp;<span style='float:right' class='glyphicon glyphicon-edit'></span></button></a>";
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
    debugger;
    var userToSave = findUser(id);
    userToSave._id = id;
    userToSave.name = name;
    userToSave.surname = surname;
    userToSave.type = "admin";//TODO: kullanıcı seçimine bağlı
    userToSave.email = email;
    var data = {accessToken: accessToken, user: userToSave };
    $.ajax({
      type: "POST",
      url: url+"service/saveuser",
      data: data,
      success: function(response){alert(response.message)},
      error: function(error){debugger;}
    });
  }
  function showWorkspaceById(workspaceId)
  {
    var splitWorkspaceId = workspaceId.split("-");
    var workspaceId = splitWorkspaceId[0];
    var userId = splitWorkspaceId[1]; 
    if(adminControl)
    {
      window.location.href=url+"workspace.html?workspaceId="+workspaceId+"&"+"userId="+userId;
    }
    
    else
    {
     window.location.href=url+"workspace.html?workspaceId="+workspaceId; 
    }
    
  }
  var addNewWorkspace = function()
  {
    $("#addNewWorkspace").click(function()
    {
      if(adminControl)
      {
        var userId = $("#userId").val();
        window.location.href=url+"workspace.html?userId="+userId;
      }
      else
      {
      window.location.href=url+"workspace.html";  
      }
      
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
                         "type": $('#platform').text().toLowerCase(),
                         "workspaces":[],
                         "players":[],
                         "mediaResources":[]
                         }};
      $.ajax({
        type: "POST",
        url: url+"service/saveuser",
        data: data,
        success: function(response)
        {
          alert(response.message);
          getUserList();
          $("#createUserModal").modal("hide");
        },
        error: function(error){debugger;}
      });
    
    })
  }
  
  var findUser = function(userId)
  {
    for(var i = 0; i<users.length;i++)
    {
      if(userId === users[i]._id)
      {
        return users[i];
      }
    }
  }
   var addUserTypeDropdownOnClick = function()
  {
    
    $('#userTypeDropdown a').click(function(e) {
      $('#userTypeDropdown a').removeClass('selected');
      $(this).addClass('selected');
    });
    
    $("#userTypeMenu").on("click", "li a", function() {
      var platform = $(this).text();
      $('#platform').html(platform);
    });
  }
  
  $( document ).ready(function() 
  {	 
    getWorkspaces(accessToken);
    addNewWorkspace();
    addCreateNewUser();
    addSaveUserButtonOnClick();
    addUserTypeDropdownOnClick();
    addLogoutButtonOnClick();
  });
 