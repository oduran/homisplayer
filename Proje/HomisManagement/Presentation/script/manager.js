  var url = Util.getWindowUrl();
  var accessToken = Util.getCookieValue("accessToken");
  var users = [];
  var adminControl=false;
  var files = [];
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
        var username = response.user.name;
        $("#username").text(username);
        if(response.user.type=="admin")
        {
         adminControl=true;
         $("#adminPanel").css("display","block");
         getUserList();
        }
        
        if(!response.user.workspaces)
        {
          return;
        }
        var userWorkspace = "<a class='list-group-item text-center' href='#' style='background: beige;'>"+response.user.name+"</a>";
        $('#workspaceList').append(userWorkspace);
        for(var i = 0 ;i<response.user.workspaces.length; i++)
        {
          var workspaceName = "<a class='list-group-item' href='#'>"
          + response.user.workspaces[i].name+
          "<button class='btn btn-info' id='"
          +response.user.workspaces[i].workspaceId+
          "' onclick=showWorkspaceById('"+response.user.workspaces[i].workspaceId+"','"+response.user._id+"') style='float:right;margin-top:-7px'>Düzenle&nbsp;<span style='float:right' class='glyphicon glyphicon-edit'></span></button></a>";
          $('#workspaceList').append(workspaceName);  
        }
      },
      error: function(error){ }
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
      {       
        users = response;      
        for(var i = 0 ;i<response.length; i++)
        {
          var user = response[i];
      //    var $html = $('<div id="MainMenu"><div class="list-group panel"><a href="#demo3" class="list-group-item list-group-item-success" data-toggle="collapse" data-parent="#MainMenu">Item 3</a><div class="collapse" id="demo3">href="#SubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubMenu1">Subitem 1 <i class="fa fa-caret-down"></i></a>     <div class="collapse list-group-submenu" id="SubMenu1">        <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 1 a</a>        <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 2 b</a>        <a href="#SubSubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubSubMenu1">Subitem 3 c <i class="fa fa-caret-down"></i></a>        <div class="collapse list-group-submenu list-group-submenu-1" id="SubSubMenu1">          <a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 1</a>          <a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 2</a>        </div>        <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 4 d</a>      </div>      <a href="javascript:;" class="list-group-item">Subitem 2</a>      <a href="javascript:;" class="list-group-item">Subitem 3</a>    </div>    <a href="#demo4" class="list-group-item list-group-item-success" data-toggle="collapse" data-parent="#MainMenu">Item 4</a>    <div class="collapse" id="demo4">      <a href="" class="list-group-item">Subitem 1</a>      <a href="" class="list-group-item">Subitem 2</a>      <a href="" class="list-group-item">Subitem 3</a>    </div>  </div></div>');
          var userList = "<a class='list-group-item' href='#' id='"+user.name+
          "'>"+ user.name+"<button class='btn btn-danger' onclick=deleteUser('"
          +user.name+"') style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-trash'></span></button><button class='btn btn-info accordion-toggle'  data-parent='#userList' data-toggle='collapse' href='#"+
          user._id+"' onclick=getWorkspacesByUsername('"+user.name+"','"+user._id+"') style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-edit'></span></button><div id='"+
          user._id+"' class='userForm collapse'><form class ='"+
          user._id+"'><fieldset><div class='form-group'><label>Kullanıcı Adı</label><input type='text' class='form-control formelement name' name='name' placeholder='Kullanıcı Adı' value="+
          user.name+"><label>Soyadı</label><input type='text' class='form-control formelement surname' name='surname' placeholder='Soyadı' value="
          +user.surname+"><label>Email</label><input type='text' class='form-control formelement email' name='email' placeholder='Email' value="+
          user.email+"><button class='btn btn-success' onclick=editUserById('"+user._id+"') style='float:right'><span style='float:right' class='glyphicon glyphicon-saved'></span></button></div></fieldset></form></div></a><input id='userId' value='"+user._id+"'/>";
          $('#userList').append(userList);  
        }
         
        for(var i = 0 ; i< users.length ; i++)
        {
          if($("#username").text()===users[i].name)
          {
            $("#userId").val(users[i]._id);
          }
        }
      },
      error: function(error){ }
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
    error: function(error){ }
    });  
  }
  
  function getWorkspacesByUsername(name,id)
  {
    if($("#"+id).hasClass('in'))
    {
      $("#"+id).removeClass('in');
      $("#"+id).addClass('collapse');
      $("#workspaceList").empty();
      getWorkspaces(accessToken);
      return;
    }
    $('.userForm').each(function() 
    {
      if($(this).hasClass('in'))
        {
          $(this).removeClass('in');
          $(this).addClass('collapse');   
        } 
    });
    
    $("#workspaceList").empty();
    $("#userId").val(id);

    var data = { accessToken:accessToken, name:name};
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
       var userWorkspace = "<a class='list-group-item text-center' href='#' style='background: beige;'>"+response.user.name+"</a>";
        $('#workspaceList').append(userWorkspace);
      for(var i = 0 ;i<response.user.workspaces.length; i++)
      {
        var workspaceId = response.user.workspaces[i].workspaceId;
        var userId = response.user._id;
        var workspaceName = "<a class='list-group-item' href='#'>"+ response.user.workspaces[i].name+"<button class='btn btn-info' id='"+response.user.workspaces[i].workspaceId+"' onclick=showWorkspaceById('"+workspaceId+"','"+userId+"') style='float:right;margin-top:-7px'>Düzenle&nbsp;<span style='float:right' class='glyphicon glyphicon-edit'></span></button></a>";
        $('#workspaceList').append(workspaceName);  
      }
    },
    error: function(error){ }
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
      error: function(error){ }
    });
  }
  function showWorkspaceById(workspaceId,userId)
  { 
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
      success: function(response){ },
      error: function(error){ }
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
        error: function(error){ }
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
  var addSelectFileMediaResources = function()
  {
     $(this).find('input[type="file"]').click();
        document.getElementById("upload_file").addEventListener("change",function(event)
        {   
          $.each(event.target.files, function(index, file) {
          
          files.push(file);
          $("#uploadingfiles").append("<div>"+file.name+"</div>");
          });

          
        });
          
  }
  var upload = function (blobOrFile,filename) {
    var fd = new FormData();    
    fd.append( 'file', blobOrFile,filename );
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/service/savemediaresource', true);
    //xhr.onreadystatechange = handler;
    xhr.send(fd);
   
 };

  var addUploadMediaResources = function()
  {
    $("#uploadMediaResources").click(function()
    {
      waitingDialog.show();
      for(var i=0;i<files.length;i++)
      {
          var BYTES_PER_CHUNK =  files[i].size;
          var SIZE = files[i].size;
          var  NUM_CHUNKS = Math.max(Math.ceil(SIZE / BYTES_PER_CHUNK), 1);
          var  start = 0;
          var end = BYTES_PER_CHUNK;
          
          while (start < SIZE)
          {
             upload(files[i].slice(start, end),files[i].name);
             start = end;
             end = start + BYTES_PER_CHUNK;
          }
      }
      
      waitingDialog.hide();
      files = [];
      $("#uploadingfiles").empty();
    })
  } 
  var waitingDialog = waitingDialog || (function ($) {
    'use strict';

	// Creating modal dialog's DOM
	var $dialog = $(
		'<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
		'<div class="modal-dialog modal-m">' +
		'<div class="modal-content">' +
			'<div class="modal-header"><h3 style="margin:0;"></h3></div>' +
			'<div class="modal-body">' +
				'<div class="progress progress-striped active" style="margin-bottom:0;"><div class="progress-bar" style="width: 100%"></div></div>' +
			'</div>' +
		'</div></div></div>');

	return {
		/**
		 * Opens our dialog
		 * @param message Custom message
		 * @param options Custom options:
		 * 				  options.dialogSize - bootstrap postfix for dialog size, e.g. "sm", "m";
		 * 				  options.progressType - bootstrap postfix for progress bar type, e.g. "success", "warning".
		 */
    message: function (message) {
        
        $dialog.find("h3").text(message);
       },
		show: function (message, options) {
			// Assigning defaults
			if (typeof options === 'undefined') {
				options = {};
			}
			if (typeof message === 'undefined') {
				message = 'Loading';
			}
			var settings = $.extend({
				dialogSize: 'm',
				progressType: '',
				onHide: null // This callback runs after the dialog was hidden
			}, options);

			// Configuring dialog
			$dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
			$dialog.find('.progress-bar').attr('class', 'progress-bar');
			if (settings.progressType) {
				$dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
			}
			$dialog.find('h3').text(message);
			// Adding callbacks
			if (typeof settings.onHide === 'function') {
				$dialog.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
					settings.onHide.call($dialog);
				});
			}
			// Opening dialog
			$dialog.modal();
		},
		/**
		 * Closes dialog
		 */
		hide: function () {
			$dialog.modal('hide');
		}
	};

})(jQuery);
  

  $( document ).ready(function() 
  { 
    
    addSelectFileMediaResources();
    getWorkspaces(accessToken);
    addNewWorkspace();
    addCreateNewUser();
    addSaveUserButtonOnClick();
    addUserTypeDropdownOnClick();
    addLogoutButtonOnClick();
    addUploadMediaResources();
  
  });
 