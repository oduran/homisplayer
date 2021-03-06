  var url = Util.getWindowUrl();
  var accessToken = Util.getCookieValue("accessToken");
  var users = [];
  var adminControl=false;
  var files = [];
  var allPlayers = [];
  var uploadRequests =[];
  var currentUserToEdit;
  var selectedPlayers=[];
  var createUserToUserNameCheck = false;
  var createUserToEmailCheck = false;
  
 /**
 * Usera ait bütün bilgilerin getirilmesine yarayan fonksiyondur.
 */
  var getUserDetails = function ()
  {
    clearAllList();
    Util.loadingDialog.show();
    if(!accessToken)
    {
      window.location.href = url+"login.html";
      return;
    }
    
    getUser("",function(user, message){
      currentUserToEdit = user;
      
      if(message)
      {
        Util.deleteCookie("accessToken");
        window.location.href = url+"login.html";
        return;
      }

      var username = user.name;
      var usertype = user.type;
      $("#username").text("Kullanıcı : "+username+"|");
      $("#usertype").text("Yetki :" + usertype);

      if(user.type=="admin")
      {
       adminControl=true;
       $("#adminPanel").css("display","block");
       $("#sendPlayerToUser").css("display","inline");
       $('#userList').empty();
       getUserList(function(userListItem){
         $('#userList').append(userListItem);
         },"adminPanel");
      }

      showUserWorkspaces(user);
      showUserMediaResources(user);
      getPlayers();
      Util.loadingDialog.hide();
    });
  };
  
  var clearAllList = function()
  {
    $("#workspaceList").empty();
    $("#userMediaResource").empty();
    $("#playerList").empty();
    $("#userNameInResource").empty();
    $("#userNameInWorkspace").empty(); 
    $("#userNameInPlayer").empty();
  }
  
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
      "<button class='btn btn-xs btn-info' id='"+user.workspaces[i].workspaceId+"' onclick=showWorkspaceByName('"+currentUserToEdit.workspaces[i].workspaceId+"','"+currentUserToEdit.name+"') style='float:right'><span class='glyphicon glyphicon-edit'></span></button>"+
      "<button class='btn btn-xs btn-success' onclick=showPlayerList('"+i+"') style='float:right'><span class='glyphicon glyphicon-play'></span></button></a>";
      $('#workspaceList').append(workspaceListItem);  
    }
  };
  
 var showPlayerList = function(a)
 {
   var workspaceindexnum = a;
   BootstrapDialog.show({
            title: 'Çalışma alanını göndermek istediğiniz oynatıcıları seçiniz.',
            message: "<div id='sendWorkspaceToPlayerList'>"+$("#playerList").html()+"</div>",
            buttons: 
            [{
                label: 'Gönder',
                action: function(dialog) {
                    $("#sendWorkspaceToPlayerList input:checked").each(function(index)
                    {
                      var indexNumber = this.value;

                      var player = allPlayers[indexNumber];
                      player.owner = currentUserToEdit.name;
                      player.workspace = currentUserToEdit.workspaces[workspaceindexnum];
                      var playerFound = false;
                      for(var i = 0; i < currentUserToEdit.players.length; i++)
                      {
                        if(currentUserToEdit.players[i].playerId === player.playerId)
                        {
                          currentUserToEdit.players[i] = player;
                          playerFound = true;
                        }
                      }
                      
                      if(!playerFound)
                      {
                        currentUserToEdit.players.push(player);
                      }
                    });
                    
                    saveUser(currentUserToEdit, function(response)
                    { 
                      Util.loadingDialog.hide();
                      Util.handleAjaxSuccess(response.message);
                      $("#playerList").empty();
                      getPlayers();
                      dialog.close();
                    });
                }
            }, 
            {
                label: 'Kapat',
                action: function(dialog) {
                    dialog.close();
                }
            }]
        });
 }
 
 var getUserPlayerList = function ()
 {
    
 }
 
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
        var thumbnailElement = "<div><img src='"+thumbnailUrl+"'/></div>";
        var mediaResourceListItem = "<a class='list-group-item' target='_blank' href='"+mediaUrl+"'>"+thumbnailElement + user.mediaResources[i].fileName+"</a>";
        $('#userMediaResource').append(mediaResourceListItem);  
      }
    }
  };
  
  /**
  * Kullanıcıya ait oynatıcıları gösterir.
  */
  var getPlayers = function(user)
  { 
    
    if(user)
    {
      showPlayers(user.players);
      return;
    }
    $.ajax({
      type: "POST",
      url: url + "service/getplayers",
      success: function(response){
        if(JSON.stringify(allPlayers)!==response.players)
        {
          showPlayers(response.players);
        }
      },
      error: Util.handleAjaxError
    });
  };
  
  var setPlayerListInterval = function()
  {
    setInterval(function(){getPlayers()},20000);
  };
  
  var showPlayers = function(players)
  {
    var userPlayer = "<a class='list-group-item text-center' href='#' style='background: beige;'>"+currentUserToEdit.name+"</a>";
    $('#userNameInPlayer').html(userPlayer);
    var playerItem="";
    allPlayers = players;
    if(!allPlayers)
    {
      return;
    }

    for(var i = 0 ;i<allPlayers.length; i++)
    {
      var player = allPlayers[i];
      var workspaceName='';
      var ownerName='';
      var workspaceEditButton = "none";
      var workspaceId="";
      var playerLights="";
      var playerState="";

      if(allPlayers[i].workspace)
      {
        workspaceName = allPlayers[i].workspace.name;
        workspaceId = allPlayers[i].workspace.workspaceId;
        workspaceEditButton = "block";
      }
      if(allPlayers[i].owner)
      {
        ownerName = allPlayers[i].owner;
      }
      if(allPlayers[i].playerState)//player state
      {
        var playerLastSeen = (allPlayers[i].playerLastSeen)?getTimeDifference(allPlayers[i].playerLastSeen):0;
        if(parseInt(playerLastSeen)>1)
        {
          allPlayers[i].playerState="stopped";
          updatePlayerState(allPlayers[i].playerId,allPlayers[i].playerState,allPlayers[i].playerLastSeen);
          playerState="Çalışmıyor";
          playerLights = '<div id="light"><span class="active" id="red"></span><span id="orange"></span><span id="green"></span></div>';
        }
        
        if(allPlayers[i].playerState === "ready")
        {
          playerState= "Hazır";
          playerLights = '<div id="light"><span id="red"></span><span id="orange"  class="active" ></span><span id="green"></span></div>';
        }
        
        if(allPlayers[i].playerState === "running")
        {
          playerState= "Çalışıyor";
          playerLights = '<div id="light"><span id="red"></span><span id="orange"></span><span id="green"  class="active"></span></div>';
        }
      }

      playerItem +=
      "<div class='checkbox playerlist'>"+
      "<h2 class='playerlistheader'>"+allPlayers[i].playerName+"</h2>"+
      "<label style='display: flex;'><input id='"+allPlayers[i].playerId+"' type='checkbox' value='"+i+"' class='playeroption'>"+
      "<div style='width:50%;margin-left: 5px;'>"+
      "<p><b style='color:red;'>Çalışma Alanı : </b>"+workspaceName+"</p>"+
      "<p><b style='color:red;'>Kullanıcı : </b>"+ownerName+"</p>"+
      "<button class='btn btn-xs btn-info' onclick=showWorkspaceByName('"+workspaceId+"','"+ownerName+"') style='display:"+workspaceEditButton+";float:left;margin-top: -5px;'>Düzenle</button><br>"+
      "</div>"+
      "<div style='width:50%'>"+
      "<p><b style='color:red;'>Oynatıcı Durumu : </b> "+playerState+"</p>"+
      ""+playerLights+
      "</div>"+
      "</label></div>";
    }
    $('#playerList').html(playerItem);  
  };
  
  var updatePlayerState = function(playerId,playerState,playerLastSeen)
  {
    var data = { playerId : playerId,playerState : playerState,playerLastSeen:playerLastSeen};
    $.ajax({
      type: "POST",
      url: url+"service/updateplayer",
      data: data,
      success:function(){},
      error: function(error){}
    });    
  };
  
  var getTimeDifference = function(playerLastSeen)
  {
    var timeStart = new Date(playerLastSeen).getTime();
    var timeEnd = new Date().getTime();
    var hourDiff = timeEnd - timeStart; //in ms
    var secDiff = hourDiff / 1000; //in s
    var minDiff = hourDiff / 60 / 1000; //in minutes
    var hDiff = hourDiff / 3600 / 1000; //in hours
    var minutesDifference = minDiff - 60 * Math.floor(hDiff);
    return minutesDifference;
  }
  
  /**
  * Player listesinde seçilen playerların bilgilierini tutan fonksiyon.
  */
  var addOptionOnChange = function () 
  {
  $('#playerList').on('change',function()
    { 
      
    }); 
  $('#userPlayerlist').on('change',function()
    { 
      userPlayerList=$(this).val();
    });     
  };
  
  /**
  * Kayıtlı bütün kullanıcıları getirir bunu sadece admin görebilir.
  * @params object user - Kullanıcı
  */
  var getUserList = function(callback,type)
  {
    var data = null;
    $.ajax({
      type: "POST",
      url: url+"service/getUsers",
      data: data,
      success: function(response)
      {       
        users = response;      
        var userListItem="";
        if(type==="adminPanel")
        {
          for(var i = 0 ;i<response.length; i++)
          {
            var user = response[i];
            userListItem += "<a class='list-group-item' href='#' id='"+user.name+
            "ListItem'>"+ user.name+"<button class='btn btn-xs btn-danger' onclick=deleteUser('"+
            user.name+"') style='float:right;'><span class='glyphicon glyphicon-trash'></span></button><button class='btn btn-xs btn-info accordion-toggle'  data-parent='#userList' data-toggle='collapse' href='#"+
            user.name+"Form' onclick=getUserDetailsByUsername('"+user.name+"') style='float:right;'><span class='glyphicon glyphicon-edit'></span></button><div id='"+
            user.name+"Form' class='userForm collapse'><form class ='"+
            user.name+"'><fieldset><div class='form-group'><label>Kullanıcı Adı</label><input type='text' class='form-control formelement name' name='name' placeholder='Kullanıcı Adı' value="+
            user.name+"><label>Soyadı</label><input type='text' class='form-control formelement surname' name='surname' placeholder='Soyadı' value="+
            user.surname+"><label>Email</label><input type='text' class='form-control formelement email' name='email' placeholder='Email' value="+
            user.email+">"+
            "<label>Kullanıcı Tipi</label><select class='usertype' name='userType'>"+createOptionStrings(user.type)+"</select><br><br>"+
            "<button class='btn btn-success' onclick=editUserByName('"+user.name+"',"+i+") style='float:right'><span  class='glyphicon glyphicon-saved'></span></button></div></fieldset></form></div></a>";
          }
        }
        if(type==="player")
        {
          for(var i = 0 ;i<response.length; i++)
          {
            var user = response[i];
            userListItem += "<option class='list-group-item' href='#' id='"+user.name+
            "playerListItem'>"+ user.name+"</option>";
          }
        }
        callback(userListItem);
      },
      error: Util.handleAjaxError
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
      getUserList(function(userListItem){
        $('#userList').append(userListItem);
        },"adminPanel");
   
    },
    error: Util.handleAjaxError
    });
  }
  
  /**
  * User listesinden seçilen user'a ait kişisel bilgilerinin getirilmesine yarayan fonsiyondur.
  * @params {string} username - Kullanıcı adı
  */
  var getUserDetailsByUsername = function(name)
  {
    Util.loadingDialog.show();
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
    clearAllList();

    getUser(name,function(user){
      currentUserToEdit = user;
      showUserWorkspaces(currentUserToEdit);
      showUserMediaResources(currentUserToEdit);
      getPlayers(currentUserToEdit);
      Util.loadingDialog.hide();  
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
    saveUser(userToSave,function(response){
      Util.loadingDialog.hide();
      Util.handleAjaxSuccess(response.message);
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
          checkUserExist(name,function(exist)
          {
              if(exist)
              {
                $("#name").removeClass("validFormElement").addClass("invalidFormElement");
                createUserToUserNameCheck=false;
              }
              
              else
              {
                $("#name").removeClass("invalidFormElement").addClass("validFormElement");
                createUserToUserNameCheck=true;
              }
            
          });
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
  var checkUserExist = function(name,callback)
  { 
    getUser(name,callback); 
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
  * Yeni kullanıcı ekle butonu.
  */
  var addSaveUserButtonOnClick = function()
  {
    $(".createUser").click(function()
    {
      var userToSave = {
                       "name":$("#name").val(),
                       "surname":$("#surname").val(),
                       "email":$("#email").val(),
                       "phone":$("#phone").val(),
                       "password":$("#password").val(),
                       "type": document.getElementById('userTypeDropdown').value,
                       "workspaces":[],
                       "players":[],
                       "mediaResources":[]
                       };
      saveUser(userToSave, function(response)
      {
        Util.handleAjaxSuccess(response.message);
        $('#userList').empty();
        getUserList(function(userListItem){
          $('#userList').append(userListItem);
          },"adminPanel");
        $("#createUserModal").modal("hide");
      });
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
     Util.handleAjaxSuccess("Dosya Yüklemesi Başarıyla Tamamlandı");
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
        Util.handleAjaxError("Dosya seçilmedi!!");
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

  var getSelectedPlayerList = function ()
  {
    selectedPlayers=[];
    $( "#playerList input:checked" ).each(function( index ) 
    {
      var playerIndex = this.value;
      var player = allPlayers[playerIndex];
      selectedPlayers.push(player);
    });
  }
  /**
  * Seçilen oynatıcıları usera gönder de açılan dialog.
  */
  var addSendPlayerToUser = function()
  {
    $("#sendPlayerToUser").click(function()
    {
      getSelectedPlayerList();

      $("#playerListModal").modal("show");
      getUserList(function(userListItem){
           $('#playerUserList').html(userListItem);
           },"player");
    });
  };      
 
  /**
  * Seçilen kullanıcılara seçilen playerları gönder butonu.
  */
  var sendPlayerToSelectedUser = function()
  {
    $("#sendUsers").click(function()
    {
     $("#playerUserList option:selected").each(function(index)
      {
        Util.loadingDialog.show();
        var name = $(this).text();
        getUser(name,function(user)
        {
          for(var i = 0;i<selectedPlayers.length;i++)
          {
            var selectedPlayer = selectedPlayers[i];
            if(selectedPlayer.owner)
            {
              getUser(selectedPlayer.owner,function(exPlayerOwner)
              {
                for(var j = 0; j<exPlayerOwner.players.length;j++)
                {
                  if(exPlayerOwner.players[j].playerId === selectedPlayer.playerId)
                  {
                    exPlayerOwner.players.splice(j,1);
                    saveUser(exPlayerOwner,function(response){});
                    break;
                  }
                }
              });
            }
            
            selectedPlayers[i].owner = user.name;
          }
          
          user.players = (user.players)? user.players : [];
          user.players = user.players.concat(selectedPlayers);
          saveUser(user,function(response)
          {
            getUserDetails();
            Util.loadingDialog.hide();
            $("#playerListModal").modal("hide");
            Util.handleAjaxSuccess(response.message);
          });
        });
      })
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
      $("#email").removeClass("invalidFormElement").addClass("validFormElement");
      createUserToEmailCheck=true;
    }
    
    else
    {
      $("#email").removeClass("validFormElement").addClass("invalidFormElement");
    }
    if(typeof email ==="undefined")
    {
      $("#email").removeClass("invalidFormElement");
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
  
  /**
  * Kullanıcıyı web servise kaydedilmesi için gönderir.
  * @param {User} user - Kaydedilecek kullanıcı.
  * @param {Function} callback - İşlem tamamlandıktan sonra çalıştırılacak callback fonksiyonu.
  */
  var saveUser = function(user,callback)
  {
    var data = {user:user};
    $.ajax({
      type: "POST",
      url: url+"service/saveuser",
      data: data,
      success: function(response)
      {
        callback(response);
      },
      error: Util.handleAjaxError
    });
  }
  
  /**
  * Kullanıcıyı web servisten getirir. Eğer isim boş, undefined, null gelirse o zaman accesstoken' a göre kullanıcı gelir.
  * @param {String} name - Kullanıcı ismi.
  * @param {Function} callback - İşlem tamamlandıktan sonra çalıştırılacak callback fonksiyonu.
  */
  var getUser = function(name,callback)
  {
    
    var data = {};
    if(name)
    {
      data.name = name;
    }
    $.ajax({
    type: "POST",
    url: url+"service/getuser",
    data: data,
    success: function(response)
    {
      callback(response.user,response.message);  
    },
    error: Util.handleAjaxError
    });
  }
  
  $( document ).ready(function() 
  { 
    addSendPlayerToUser();
    addOptionOnChange();
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
    sendPlayerToSelectedUser();
    setPlayerListInterval();
  });
 