  var url = Util.getWindowUrl();
  var accessToken = Util.getCookieValue("accessToken");
  var users = [];
  var adminControl=false;
  var files = [];
  var uploadRequests =[];
  var currentUserToEdit;
  var createUserToEmailCheck = false;
  
 /**
 * Usera ait bütün bilgilerin getirilmesine yarayan fonksiyondur.
 */
  var getUserDetails = function ()
  {
    $("#workspaceList").empty();
    $("#userMediaResource").empty();
    $("#userNameInResource").empty();
    $("#userNameInWorkspace").empty();
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
        currentUserToEdit = response.user;
        Util.loadingDialog.hide();
        
        if(response.message)
        {
          Util.deleteCookie("accessToken");
          window.location.href = url+"login.html";
          return;
        }

        var username = response.user.name;
        var usertype = response.user.type;
        $("#username").text("Kullanıcı : "+username+"|");
        $("#usertype").text("Yetki :" + usertype);

        if(response.user.type=="admin")
        {
         adminControl=true;
         $("#adminPanel").css("display","block");
         getUserList();
        }

        showUserWorkspaces(response.user);
        showUserMediaResources(response.user);
      },
      error: function(error){ }
    });
  };
  
 /**
 * Usera ait workspaceleri getirilmesine yarayan fonsiyondur.
 * @params object user - Kullanıcı
 * returns - Kullanıcıya ait çalışma alanları bulur ve bitirir.
 */
  var showUserWorkspaces = function(user)
  {
    var userWorkspaceHeader = "<a class='list-group-item text-center' href='#' style='background: beige;'>"+user.name+"</a>";
    $('#userNameInWorkspace').append(userWorkspaceHeader);
    
    if(!user.workspaces)
    {
      return;
    }

    for(var i = 0 ;i<user.workspaces.length; i++)
    {
      var workspaceListItem = "<a class='list-group-item' href='#'>"+ 
      user.workspaces[i].name+
      "<button class='btn btn-info' id='"+
      user.workspaces[i].workspaceId+
      "' onclick=showWorkspaceByName('"+currentUserToEdit.workspaces[i].workspaceId+"','"+currentUserToEdit.name+"') style='float:right;margin-top:-7px'>Düzenle&nbsp;<span style='float:right' class='glyphicon glyphicon-edit'></span></button></a>";
      $('#workspaceList').append(workspaceListItem);  
    }
  };
  
 /**
 * Usera ait media resourceların getirilmesine yarayan fonsiyondur.
 * @params object user - Kullanıcı
 * returns - Kullanıcıya ait medya kaynakları bulur ve bitirir.
 */
  var showUserMediaResources = function(user)
  { 
    var userMediaResourcesHeader = "<a class='list-group-item text-center' href='#' style='background: beige;'>"+user.name+"</a>";
    $('#userNameInResource').append(userMediaResourcesHeader);
    
    if(!user.mediaResources)
    {
      return;
    }
 
    if(user.mediaResources)
    {
      for(var i = 0 ;i<user.mediaResources.length; i++)
      {
        var mediaResource = user.mediaResources[i];
        var mediaUrl = url + mediaResource.url;
        var thumbnailUrl = mediaResource.thumbnailUrl;
        if(mediaResource.fileType !== "image")
        {
          thumbnailUrl = url + "media/videothumb.png";
        }
        var thumbnailElement = "<div><img src='"+thumbnailUrl+"'/></div>";
        var mediaResourceListItem = "<a class='list-group-item' target='_blank' href='"+mediaUrl+"'>"+thumbnailElement + user.mediaResources[i].fileName+"</a>";
        $('#userMediaResource').append(mediaResourceListItem);  
      }
    }
    else
    {
      return;
    }
  };
  
  /**
  * Kayıtlı bütün kullanıcıları getirir bunu sadece admin görebilir.
  * @params object user - Kullanıcı
  */
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
          var userListItem = "<a class='list-group-item' href='#' id='"+user.name+
          "ListItem'>"+ user.name+"<button class='btn btn-danger' onclick=deleteUser('"+
          user.name+"') style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-trash'></span></button><button class='btn btn-info accordion-toggle'  data-parent='#userList' data-toggle='collapse' href='#"+
          user.name+"Form' onclick=getUserDetailsByUsername('"+user.name+"') style='float:right;margin-top:-7px'><span style='float:right' class='glyphicon glyphicon-edit'></span></button><div id='"+
          user.name+"Form' class='userForm collapse'><form class ='"+
          user.name+"'><fieldset><div class='form-group'><label>Kullanıcı Adı</label><input type='text' class='form-control formelement name' name='name' placeholder='Kullanıcı Adı' value="+
          user.name+"><label>Soyadı</label><input type='text' class='form-control formelement surname' name='surname' placeholder='Soyadı' value="+
          user.surname+"><label>Email</label><input type='text' class='form-control formelement email' name='email' placeholder='Email' value="+
          user.email+">"+
          "<label>Kullanıcı Tipi</label><select class='usertype' name='userType'>"+createOptionStrings(user.type)+"</select><br><br>"+
          "<button class='btn btn-success' onclick=editUserByName('"+user.name+"',"+i+") style='float:right'><span style='float:right' class='glyphicon glyphicon-saved'></span></button></div></fieldset></form></div></a>";
          $('#userList').append(userListItem);  
        }
      },
      error: function(error){ }
    });
  };
 
  /**
  * User listesinden seçilen user'ı silme işlemini yapmadan önce çıkan alert.
  * @params : username
  */
  var  deleteUser = function(username)
  { 
    BootstrapDialog.show({
            title: 'Uyarı',
            message: username+' adlı kullanıcıyı silmek istiyor musunuz?',
            buttons: [{
                label: 'Evet',
                action: function(dialog) {
                    dialog.close();
                    deleteUserWithName(username);
                }
            }, {
                label: 'Hayır',
                action: function(dialog) {
                    dialog.close();
                }
            }]
        });
  };
  
  /**
  * User listesinden seçilen user'ı silme işlemini yapan fonsiyondur.
  * @params : username
  */
  var deleteUserWithName = function (username)
  {
    var data = {name : username};
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
  
  /**
  * User listesinden seçilen user'a ait kişisel bilgilerinin getirilmesine yarayan fonsiyondur.
  * @params {string} username - Kullanıcı adı
  */
  var getUserDetailsByUsername = function(name)
  {
    if($("#"+name+"Form").hasClass('in'))
    { 
      $("#"+name).removeClass('in');
      $("#"+name).addClass('collapse');
      getUserDetails();
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
    $("#userNameInResource").empty();
    $("#userNameInWorkspace").empty();
    $("#workspaceList").empty();
    $("#userMediaResource").empty();

    var data = {name:name};
    $.ajax({
    type: "POST",
    url: url+"service/getuser",
    data: data,
    success: function(response)
    {
      currentUserToEdit = response.user;
      showUserWorkspaces(response.user);
      showUserMediaResources(response.user);
    },
    error: function(error){ }
    });
  };
  
  /**
  * User listesinden seçilen user'a ait editlenen kişisel bilgilerin kaydedilmesine yarayan fonsiyondur.
  * @param {string} username - Kullanıcı adı.
  * @param {int} index -  User listesinden seçilen user'ın indexi.
  */
  var editUserByName = function(userName, index)
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
     
    var userToSave = currentUserToEdit;
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
  };
  
  /**
  * User listesinden seçilen user'a ait editlenen kişisel bilgilerin kaydedilmesine yarayan fonsiyondur.
  * @param {string} username - Kullanıcı adı.
  * @param {int} workspaceId - Çalışma alanı listesinde seçilen çalışma alanının id'si.
  */
  var showWorkspaceByName = function(workspaceId,userName)
  { 
    if(adminControl)
    {
      window.location.href=url+"workspace.html?workspaceId="+workspaceId+"&"+"userName="+userName;
    }
    else
    {
      window.location.href=url+"workspace.html?workspaceId="+workspaceId; 
    }
  };
  
  /**
  * User yeni çalışma alanı eklemesine yarayan fonsiyondur.
  */
  var addNewWorkspace = function()
  {
    $("#addNewWorkspace").click(function()
    {
      if(adminControl && $(".userForm.in").length !== 0)
      {
        var userName = $(".userForm.in form input.name").val();
        window.location.href=url+"workspace.html?userName="+userName;
      }
      else
      {
        window.location.href=url+"workspace.html";  
      }
    });
  };
  
  /**
  * Yeni user oluşturulan fonsiyondur.
  */
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
  };
  
  /**
  * Yeni user oluştururken kullanıcı adının kullanılıp kullanılmadığını kontrol eden fonksiyondur.
  */
  var checkUser = function(name)
  { 
    var data = {name:name};
    $.ajax({
      type: "POST",
      url: url+"service/getuser",
      data: data,
      success: function(response){ },
      error: function(error){ }
    });
  };
  
  /**
  * Çıkış butonu.
  */
  var addLogoutButtonOnClick = function()
  {
    $("#logoutButton").click(function()
    {
      Util.deleteCookie("accessToken");
      window.location.href=url;
    });
  };
  
  /**
  * Çıkış butonu.
  */
  var addSaveUserButtonOnClick = function()
  {
    $(".createUser").click(function()
    {
      if(createUserToEmailCheck===true)
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
      }
      else
      {
        BootstrapDialog.alert("Email adresi geçerli değil");
      }
    });
  };
  
  /**
  * Yeni kaynak eklerken fileların tutulduğu fonksiyon.
  */
  var addSelectFileMediaResources = function()
  {
    $(this).find('input[type="file"]').click();
    document.getElementById("uploadFile").addEventListener("change",function(event)
    {   
      $.each(event.target.files, function(index, file) 
      {
        var fileIndex  ="<div class='mediaelement'><div >"+file.name+"</div><div class='progress'><div id='"+file.name+"' class='progress-bar progress-bar-info' role='progress-bar ' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='height:20px'>&nbsp;</div></div></div>";
        files.push(file);
        $("#uploadingFiles").append(fileIndex);
      });
    });
  };
  
  /**
  * Seçilen medya kaynakları upload eden fonksiyon.
  *@param {file} file - Seçilen dosya.
  *@param {string} filename - Seçilen dosyanın adı.
  */
  var upload = function (file,filename) 
  {
   
    var fd = new FormData();    
    var count=0;
    fd.append('totalNumberOfFiles', files.length);
    fd.append('name', currentUserToEdit.name);
    fd.append('file', file,filename );

    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", function(evt){updateProgress(evt,filename);});
    xhr.addEventListener("load", function(evt){transferComplete(evt,filename);});
    xhr.addEventListener("error", function(evt){transferFailed(evt,filename);});
    xhr.addEventListener("abort", function(evt){transferCanceled(evt,filename);});
    xhr.open('POST', '/service/savemediaresource', true);
    xhr.send(fd);
    uploadRequests.push(xhr);
  };
  
  /**
  * Upload başarıyla tamamlandığında girdiği fonksyion.
  *@param event - Dosyanın upload kısmındaki event.
  *@param {string} filename - Seçilen dosyanın adı.
  */
  var updateProgress = function(evt, filename) 
  {
    if (evt.lengthComputable)
    {
      var percentage = parseInt((evt.loaded / evt.total * 100));
      document.getElementById(filename).setAttribute("aria-valuenow",""+percentage+""); 
      document.getElementById(filename).style.width=percentage+"%"; 
      document.getElementById(filename).innerHTML=percentage+"%"; 
    }
  };
  
  /**
  * Bütün dosyaların upload işlemi bittiğinde girdiği fonksiyon.
  *@param event - Dosyanın upload kısmındaki event.
  *@param {string} filename - Seçilen dosyanın adı.
  */
  var transferComplete = function(evt, filename) 
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
     getUserDetails();
     $("#fileUploadModal").modal("hide");
     uploadRequests=[];
    }
  };

  /**
  * Dosya upload esnasında fail olursa girilen fonksiyon.
  *@param event - Dosyanın upload kısmındaki event.
  *@param {string} filename - Seçilen dosyanın adı.
  */
  var transferFailed = function(evt, filename) 
  {
    document.getElementById(filename).setAttribute("class","progress-bar-danger"); 
  };
  
  /**
  * Dosya upload iptal edildiğinde girilen fonksiyon.
  *@param event - Dosyanın upload kısmındaki event.
  *@param {string} filename - Seçilen dosyanın adı.
  */
  var transferCanceled = function(evt, filename) 
  {
    $("#fileUploadModal").modal("hide");
    uploadRequests=[];
    getUserDetails();
  };
  
  /**
  * Dosyaları yükle butonu.
  */
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
  };
  
  /**
  * Yeni kaynak ekle butonu.
  */
  var addNewMediaResourceButton = function()
  {
    $("#addNewMediaResources").click(function()
    {
      $("#fileUploadModal").modal("show");
      files=[];
      $("#uploadingFiles").empty();
      $("#uploadFile").val("");
    });
  };  

  /**
  * Yeni user kaydı oluşturulurken email check edilen fonksiyon.
  * @params {string} email - Kullanıcı email
  * returns  - Kaydedilen kullanıcının emailini kontrol eder doğruysa border green yanlışsa red olarak döndürür.
  */  
  var addCheckEmailisValid = function(email) 
  {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(re.test(email))
    {
      $("#email").css("border","1px solid green");
      createUserToEmailCheck=true;
    }
    
    else
    {
      $("#email").css("border","1px solid red");
    }
  };
  
  /**
  * User typeları combobox şeklinde çıkartılmasını sağlar.
  * @params {string} userType - Kullanıcı tipi
  * returns {string} optionString - Gelen kullanıcı tipi hangi tipteyse onu selected optiona koyup döndürür.
  */
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
  };
  
  /**
  * Dosya upload iptal etme butonu.
  */
  var addCancelUploadButtonOnClick = function () 
  {
    $("#cancelUpload").click(function()
    {
      if(files.length>0)
      {
        BootstrapDialog.show({
            title: 'Uyarı',
            message: 'Dosya yüklemesini iptal etmek istiyor musunuz?',
            buttons: [{
                label: 'Evet',
                action: function(dialog) {
                    dialog.close();
                    cancelUpload();
                    $("#fileUploadModal").modal("hide");
                }
            }, {
                label: 'Hayır',
                action: function(dialog) {
                    dialog.close();
                }
            }]
        });
      }
      else
      {
        $("#fileUploadModal").modal("hide");
      }
    });   
  };
  
  /**
  * Yüklenmeyen bütün dosyaların iptalini gönderen fonksiyon.
  */
  var cancelUpload = function ()
  {
    for(var i=0;i<uploadRequests.length;i++)
    {
      uploadRequests[i].abort();
    }
  };
    
  $( document ).ready(function() 
  { 
    addCancelUploadButtonOnClick();
    addCheckEmailisValid();
    addNewMediaResourceButton();
    addSelectFileMediaResources();
    getUserDetails();
    addNewWorkspace();
    addCreateNewUser();
    addSaveUserButtonOnClick();
    addLogoutButtonOnClick();
    addUploadMediaResources();
  });
 