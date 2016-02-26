  var url = Util.getWindowUrl();
  var accessToken = Util.getCookieValue("accessToken");
  var users = [];
  var adminControl=false;
  var files = [];
  var uploadRequests =[];
  var getWorkspaces = function (accessToken)
  {
    $("#workspaceList").empty();
    $("#userMediaResource").empty();
    Util.loadingDialog.show();
    if(!accessToken)
    {
      window.location.href = url+"login.html";
      return;
    }
    
    var data = {};
    $.ajax({
      type: "POST",
      url: url+"service/getuser",
      data: data,
      success: function(response)
      {  
        Util.loadingDialog.hide();
        
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

        getUserWorkspace(response.user);
        getUserMediaResources(response.user);
        
      },
      error: function(error){ }
    });
  }
  
  var getUserWorkspace = function(user)
  {
    if(!user.workspaces)
    {
      return;
    }
    
    var userWorkspace = "<a class='list-group-item text-center' href='#' style='background: beige;'>"+user.name+"</a>";
    $('#workspaceList').append(userWorkspace);
    for(var i = 0 ;i<user.workspaces.length; i++)
    {
      var workspaceName = "<a class='list-group-item' href='#'>"
      + user.workspaces[i].name+
      "<button class='btn btn-info' id='"
      +user.workspaces[i].workspaceId+
      "' onclick=showWorkspaceByName('"+user.workspaces[i].workspaceId+"','"+user.name+"') style='float:right;margin-top:-7px'>Düzenle&nbsp;<span style='float:right' class='glyphicon glyphicon-edit'></span></button></a>";
      $('#workspaceList').append(workspaceName);  
    }
  }
  
  var getUserMediaResources = function(user)
  { 
    if(!user.mediaResources)
    {
      return;
    }
    
    var userMediaResource = "<a class='list-group-item text-center' href='#' style='background: beige;'>"+user.name+"</a>";
    $('#userMediaResource').append(userMediaResource);
    if(user.mediaResources)
    {
      for(var i = 0 ;i<user.mediaResources.length; i++)
      {
        var mediaUrl = url + user.mediaResources[i].url;
        var mediaResourceName = "<a class='list-group-item' target='_blank' href='"+mediaUrl+"'>"
        + user.mediaResources[i].fileName+"</a>";
        $('#userMediaResource').append(mediaResourceName);  
      }
    }
    else
    {
      return;
    }
  }
  
  var getUserList = function()
  {
    $('#userList').empty();
    var data = null;
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
          var userList = "<a class='list-group-item' href='#' id='"+user.name+
          "ListItem'>"+ user.name+"<button class='btn btn-danger' onclick=deleteUser('"
          +user.name+"') style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-trash'></span></button><button class='btn btn-info accordion-toggle'  data-parent='#userList' data-toggle='collapse' href='#"+
          user.name+"Form' onclick=getWorkspacesByUsername('"+user.name+"') style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-edit'></span></button><div id='"+
          user.name+"Form' class='userForm collapse'><form class ='"+
          user.name+"'><fieldset><div class='form-group'><label>Kullanıcı Adı</label><input type='text' class='form-control formelement name' name='name' placeholder='Kullanıcı Adı' value="+
          user.name+"><label>Soyadı</label><input type='text' class='form-control formelement surname' name='surname' placeholder='Soyadı' value="
          +user.surname+"><label>Email</label><input type='text' class='form-control formelement email' name='email' placeholder='Email' value="+
          user.email+">"+
          "<label>Kullanıcı Tipi</label><select class='usertype' name='userType'>"+createOptionStrings(user.type)+"</select><br><br>"+
          "<button class='btn btn-success' onclick=editUserByName('"+user.name+"',"+i+") style='float:right'><span style='float:right' class='glyphicon glyphicon-saved'></span></button></div></fieldset></form></div></a>";
          $('#userList').append(userList);  
        }
      },
      error: function(error){ }
    });
  }
 
  function deleteUser(name)
  { 
    var data = {name : name};
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
  
  function getWorkspacesByUsername(name)
  {
    if($("#"+name+"Form").hasClass('in'))
    { 
      $("#"+name).removeClass('in');
      $("#"+name).addClass('collapse');
      $("#workspaceList").empty();
      $("#userMediaResource").empty();
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
    $("#userMediaResource").empty();

    var data = {name:name};
    $.ajax({
    type: "POST",
    url: url+"service/getuser",
    data: data,
    success: function(response)
    {
      getUserWorkspace(response.user);
      getUserMediaResources(response.user);

    },
    error: function(error){ }
    });
  }
  
  function editUserByName(userName, index)
  {
    Util.loadingDialog.show();
    var name="";
    var surname="";
    var email="";
    var userType="";
    $('.'+userName+' input' ).each(function() 
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
    $('.'+userName+' select' ).each(function() 
    {
      if($(this).attr('name')==="userType")
      {
        userType = $(this).val();
      }
    });
     
    var userToSave = users[index];
    userToSave.name = name;
    userToSave.surname = surname;
    userToSave.type = userType;
    userToSave.email = email;
    var data = {user: userToSave };
    $.ajax({
      type: "POST",
      url: url+"service/saveuser",
      data: data,
      success: function(response)
      { 
        Util.loadingDialog.hide();
        BootstrapDialog.alert(response.message);
      },
      error: function(error){ }
    });
  }
  function showWorkspaceByName(workspaceId,userName)
  { 
    if(adminControl)
    {
      window.location.href=url+"workspace.html?workspaceId="+workspaceId+"&"+"userName="+userName;
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
      if(adminControl && $(".userForm.in").length != 0)
      {
        var userName = $(".userForm.in form input.name").val();
        window.location.href=url+"workspace.html?userName="+userName;
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
      $("#email").focusout(
      function (event) 
      {
        var email = $("#email").val();
        addCheckEmailisValid(email);
      });
      
    });
  }
  function checkUser(name)
  { 
    var data = {name:name};
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
                         "type": document.getElementById('userTypeDropdown').value,
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
          BootstrapDialog.alert(response.message);
          getUserList();
          $("#createUserModal").modal("hide");
        },
        error: function(error){ }
      });
    
    })
  }

  var addSelectFileMediaResources = function()
  {
    $(this).find('input[type="file"]').click();
    document.getElementById("uploadFile").addEventListener("change",function(event)
    {   
      $.each(event.target.files, function(index, file) {
      var fileIndex  ="<div class='mediaelement'><div >"+file.name+"</div><div class='progress'><div id='"+file.name+"' class='progress-bar progress-bar-info' role='progress-bar ' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='height:20px'>&nbsp;</div></div></div>"
      files.push(file);
      $("#uploadingFiles").append(fileIndex);
      });
    });
  }
  var upload = function (file,filename) {
   
    var fd = new FormData();    
    var count=0;
    fd.append( 'totalNumberOfFiles', files.length );
    fd.append( 'file', file,filename );

    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", updateProgress);
    xhr.addEventListener("load", transferComplete);
    xhr.addEventListener("error", transferFailed);
    xhr.addEventListener("abort", transferCanceled);
    xhr.open('POST', '/service/savemediaresource', true);
    xhr.send(fd);
    uploadRequests.push(xhr);

   function updateProgress (oEvent) 
   {
      if (oEvent.lengthComputable)
      {
        var pc = parseInt((oEvent.loaded / oEvent.total * 100));
        document.getElementById(filename).setAttribute("aria-valuenow",""+pc+""); 
        document.getElementById(filename).style.width=pc+"%"; 
        document.getElementById(filename).innerHTML=pc+"%"; 
      }
    }

    function transferComplete(evt) 
    {
     
     var file = document.getElementById(filename);
     file.setAttribute("class","progress-bar-success"); 
     for(var i=0;i<files.length;i++)
     {
       if(files[i].name==filename)
       {
         files.splice(i,1);
       }
     }
     
     if(files.length===0)
     {
       BootstrapDialog.alert("Dosya Yüklemesi Başarıyla Tamamlandı");
       files=[];
       $("#uploadingFiles").empty();
       document.getElementById("uploadFile").value = "";
       $("#workspaceList").empty();
       $("#userMediaResource").empty();
       getWorkspaces(accessToken);
       $("#fileUploadModal").modal("hide");
       uploadRequests=[];
     }
     
    }

    function transferFailed(evt) 
    {
      document.getElementById(filename).setAttribute("class","progress-bar-danger"); 
    }

    function transferCanceled(evt) 
    {
    }
 };

  var addUploadMediaResources = function()
  {
    $("#uploadMediaResources").click(function()
    {
      if(files.length===0)
      {
        BootstrapDialog.alert("Dosya seçilmedi!!");
      }
      
      for(var i=0;i<files.length;i++)
      {
       upload(files[i],files[i].name);
      }
      
    });
  }
  var addNewMediaResourceButton = function()
  {
    $("#addNewMediaResources").click(function()
    {
      $("#fileUploadModal").modal("show");
      files=[];
      $("#uploadingFiles").empty();
      $("#uploadFile").val("");
    });
  }   
   
  var addCheckEmailisValid = function(email) 
  {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(re.test(email))
      {
        $("#email").css("border","1px solid green");
      }
      
      else
      {
        $("#email").css("border","1px solid red");
      }
  }
  
  // Creates options string for user edit combobox. Chooses the one which was given as userType.
  var createOptionStrings = function(userType)
  {
    var optionsString = "";
    var userTypes = ["admin","user"];
    for(var i=0;i<userTypes.length;i++)
    {   
        var stringAddition = (userType === userTypes[i])? "selected":"";
        optionsString += "<option value='"+userTypes[i]+"' "+stringAddition+">"+userTypes[i]+"</option>";
    }
    return optionsString;
  }
  
  var addCancelUploadButtonOnClick = function () 
  {
    $("#cancelUpload").click(function()
    {
      BootstrapDialog.show({
            title: 'Uyarı',
            message: 'Dosya yüklemesini iptal etmek istiyor musunuz?',
            buttons: [{
                label: 'Evet',
                action: function(dialog) {
                    dialog.close();
                    cancelUpload();
                }
            }, {
                label: 'Hayır',
                action: function(dialog) {
                    dialog.close();
                }
            }]
        });
    });   
  }
  
  
  var cancelUpload = function ()
  {
    for(var i=0;i<uploadRequests.length;i++)
      {
        uploadRequests[i].abort();
      }
    
    $("#fileUploadModal").modal("hide");
    uploadRequests=[];
    getWorkspaces(accessToken);
  }
    
    
  
  $( document ).ready(function() 
  { 
    addCancelUploadButtonOnClick();
    addCheckEmailisValid();
    addNewMediaResourceButton();
    addSelectFileMediaResources();
    getWorkspaces(accessToken);
    addNewWorkspace();
    addCreateNewUser();
    addSaveUserButtonOnClick();
    addLogoutButtonOnClick();
    addUploadMediaResources();
  
  });
 