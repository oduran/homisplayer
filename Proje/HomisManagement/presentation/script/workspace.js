//Duvar ekleme çıkarma timeline fonksiyonlarını içeren yönetici sınıf.
var WallManager = function () {
  
  google.load('visualization', '1', {packages: ['timeline']});
  this.temp=0;
  this.screentype = "dividedscreen";	
  this.date = new Date();
  var url = Util.getWindowUrl();
  var serviceUrl = url+"service/";
  var accessToken = Util.getCookieValue("accessToken");
  var currentStep=1;
  var currentWallStep=1;
  var numberOfSteps=$(".modal-step").length;
  var numberOfWallSteps=$(".modal-wallstep").length;
  var totalMinutes=0;
  var differenceTotalMinutes=0;
  var start;
  var end;
  var workspaceObj={};
  var walls=[];
  var user;
  
  if(!accessToken)
  {
    window.location.href = url+"login.html";
    return;
  }
  
  //Set edilen baslangıç ve bitiş zamanlarının arasındaki dakika farkını bulan fonksiyon. Burada startTime ve endTime da set ediliyor.
  var calculateTimeDifference = function(startTime,endTime)
  {
    var time1 = startTime.split(':');
    var time2 = endTime.split(':');
    var startHour = parseInt(time1[0], 10); 
    var endHour = parseInt(time2[0], 10);
    var startMin = parseInt(time1[1], 10);
    var endMin = parseInt(time2[1], 10);
    var hours = endHour - startHour, mins = 0;
    if(hours < 0) hours = 24 + hours;
    if(endMin >= startMin) {
       mins = endMin - startMin;
    }
    else {
       mins = (endMin + 60) - startMin;
       hours--;
    }
    mins = mins / 60; // take percentage in 60
    hours += mins;
    return [hours*60,startHour,startMin,endHour,endMin];
  }
    
  // Timeline datarow çizimi sağlıyor
  var drawVisualization = function()
  { 
    totalMinutes=0;
    var	data= null;
    data = new google.visualization.DataTable();
    data.addColumn('string', 'Tip');
    data.addColumn('string','İsim');
    data.addColumn('date', 'Başlangıç Zamanı');
    data.addColumn('date', 'Bitiş Zamanı');
    data.addRows(createRows());
    var options = 
    {
      height: 450,
      timeline: {groupByRowLabel:true}
    };
    // Instantiate our timeline object.
    var chart = new google.visualization.Timeline(document.getElementById('timeline'));
    chart.draw(data, options);
  }
  
  var createRows = function() 
  { 
    var rows = [];
    var periodicWalls = [];
    var timedWalls = [];
    for(var j=0;j<walls.length;j++)
    {
      if(walls[j].showTime.indexOf("-")=== -1 )
      {
        periodicWalls.push(walls[j]);
      }
      else
      {
        timedWalls.push(walls[j]);
      }
    }
    
    if(timedWalls.length===0&&periodicWalls.length===0)
    {
      $("#timeline").empty();
      return;
    }
    
    var timeIntervalArray = divideTime({startTime: new Date(self.start.getTime()), endTime: new Date(self.end.getTime())}, timedWalls);//input-output date
    for(var i = 0; i<timeIntervalArray.length;i++)
    {
      var startTimeString = timeIntervalArray[i].startTime.getHours()+":"+timeIntervalArray[i].startTime.getMinutes();
      var endTimeString = timeIntervalArray[i].endTime.getHours()+":"+timeIntervalArray[i].endTime.getMinutes();
      var timeDifference = calculateTimeDifference(startTimeString,endTimeString);
      var totalSpentTime = 0;
      do
      {
        for(var k=0;k<periodicWalls.length;k++)
        {	
          totalSpentTime += parseInt(periodicWalls[k].showTime);
          var startTime= new Date(timeIntervalArray[i].startTime.getTime());
          var endTime= (totalSpentTime>timeDifference[0]) ? timeIntervalArray[i].endTime : new Date(timeIntervalArray[i].startTime.getTime()+(parseInt(periodicWalls[k].showTime)*60000));
          rows.push(["Zaman Çizelgesi", periodicWalls[k].id.replace("wall","ekran"), startTime, endTime]);
          timeIntervalArray[i].startTime.setTime(endTime.getTime());
        }
        
      }while(timeDifference[0]>totalSpentTime&&totalSpentTime!==0)
    }
  
    for(var i=0 ; i<timedWalls.length;i++)
    {
      var determinedTime = splitDeterminedShowTime(timedWalls[i].showTime);
      rows.push(["Zaman Çizelgesi", timedWalls[i].id.replace("wall","ekran"), determinedTime.startTime, determinedTime.endTime]);
    }
  
    return rows;
  }
  
  var sortDividedTime = function (date1, date2)
  {
    if (date1.startTime > date2.startTime) return 1;
    if (date1.startTime < date2.startTime) return -1;
    return 0;
  };
  
  var divideTime = function(workspaceTime,timedWalls)
  { 

    var dividedArray=[];
    var timePart={startTime:workspaceTime.startTime};
    var determinedArray =[];
    if(timedWalls.length==0)
    { 
      return [{startTime:stringToDate($("#datetimepicker1").find("input").val()),endTime:stringToDate($("#datetimepicker2").find("input").val())}];
    }
    
    for(var i=0;i<timedWalls.length;i++)
    { 
      var determinedTime = splitDeterminedShowTime(timedWalls[i].showTime);
      determinedArray.push(determinedTime);
      determinedArray.sort(sortDividedTime);
    }

    for(var i=0;i<determinedArray.length;i++)
    { 
      timePart.endTime=determinedArray[i].startTime;
      if(timePart.startTime.toString() !== timePart.endTime.toString())
      {
        dividedArray.push(timePart);
      }
      
      timePart={startTime:determinedArray[i].endTime}
    } 
    timePart.endTime = workspaceTime.endTime;
    dividedArray.push(timePart);
  
    return dividedArray;
  }
  
  //Belirlenen sürenin dakika saat ve başlangıç-bitiş zamanını ayırır.
  var splitDeterminedShowTime = function (determinedTimeString)
  {
    var splitTimer = determinedTimeString.split("-");
    return {startTime:stringToDate(splitTimer[0]),endTime:stringToDate(splitTimer[1])};
  }
  
  var stringToDate = function(dateString)
  {
    var splittedTime = dateString.split(":");
    var hour = splittedTime[0];
    var minute = splittedTime[1];
    var time = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),hour,minute,0);
    return time;
  }
  
  // Workspace halihazırda varsa ekrana servisten gelen workspace objesinde belirlenmiş olan duvarları ekler.
  var getWorkspace = function(userName, workspaceId)
  {
    var targetUrl = serviceUrl+"getworkspace";
    var data = {  workspaceId: workspaceId};
    
    if(userName)
    {
      data = { name: userName};
      targetUrl = serviceUrl+"getUser"
    }

    $.ajax({
      type: "POST",
      url:  targetUrl,
      data: data,
      success: function(response){
        if(response.message)
        {
          return;
        }
        workspaceObj = userName? findUserWorkspace(workspaceId,response.user.workspaces) : response;
        user = userName? response.user : user;
        $( "#pageHeight" ).val(workspaceObj.height);
        $( "#pageWidth" ).val(workspaceObj.width);
        $("#datetimepicker1").find("input").val(workspaceObj.starttime);
        $("#datetimepicker2").find("input").val(workspaceObj.endtime);
        var workspaceTimer = splitStartAndEndTime(workspaceObj.starttime,workspaceObj.endtime)
        self.start = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),workspaceTimer.startTime,workspaceTimer.startTimeMinute,0);
        self.end = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),workspaceTimer.endTime,workspaceTimer.endTimeMinute,0);

        for(var i = 0 ; i<workspaceObj.walls.length ;i++)
        {
          var wall = {
          id: workspaceObj.walls[i].id,
          type: workspaceObj.walls[i].type,
          showTime: workspaceObj.walls[i].showTime,
          screens: workspaceObj.walls[i].screens,

          }
          walls.push(wall);
          createDiv(wall);
          drawVisualization();
        }
      },
      error: function(error){
        BootstrapDialog.alert("hata:"+error.toString());
      }
    });
  }
  
  function getNewWallUpdateTimeSelectedTab ()
  {
    var newWallTime = 0;
    var $tab = $('#changeTimeTabContent');
    var $active = $tab.find('.tab-pane.active');
    if($active[0].id==="changeDeterminedTime")
    {
      if($("#changeDeterminedTimepicker1").find("input").val()>=$("#changeDeterminedTimepicker2").find("input").val())
      {
        return false;
      }
      var startTime =$("#changeDeterminedTimepicker1").find("input").val();
      var endTime = $("#changeDeterminedTimepicker2").find("input").val();
      var checkUsedTimeFlag = checkUsedTime(startTime,endTime);
      if(checkUsedTimeFlag==false)
      {
        return false;
      }
      newWallTime = startTime+"-"+endTime;
    }
    else
    {
      newWallTime = $active.find('input').val();
    }
    
    return newWallTime;
  }
  
  var addChangeTimeApply = function()
  {
    $("#changeTimeApply").click(function()
    {
      for (var i in walls) 
      {
       if (walls[i].id == $("#changeTimeScreenName").val()) 
       {  walls[i].showTime ="-";
          var newMinutes = getNewWallUpdateTimeSelectedTab();
          
          if(newMinutes==false)
          {
            BootstrapDialog.alert("Girdiğiniz zaman aralığı kullanılmaktadır.")
            return false;
          }
          walls[i].showTime =newMinutes;
          drawVisualization();
          break; //Stop this loop, we found it!
       }
      }
      $('#changeTimeModal').modal('hide');
    });
  }
 
  //Ekran zamanını değiştirmeye yarayan fonksiyon
  var addChangeTimeOnClick = function () 
  {
    $(document).on("click", ".changeTime", function () 
    {
      var wallId = $(this).parent().find('h2').html();
      var screenName = wallId.replace("Ekran","wall");
       $("#changeTimeScreenName").val(""+screenName);
    });
    
  }
  //Ekranı silmeye yarayan fonksiyon
  var addRemoveScreenOnClick = function () 
  {
   $(document).on('click', '.removeScreen', function()
    {  
        var wallId = $(this).parent().find('h2').html();
        var removeItem = wallId.replace("Ekran","wall");
        var screenName = wallId.replace(/[0-9]/g, '');
        for(var i=0;i<walls.length;i++)
        {
            if(walls[i].id == removeItem){
                walls.splice(i,1);
            }
        }
        
        $(this).parent().remove();
        drawVisualization();
    });
  }
  // Başlangıçta çalışma alanı, ekran büyüklüklerinin girilebileceği modal penceresinin açılmasını sağlar ve sürükle bırak objelerini set eder.
  this.initialize = function()
  {
    setHtmlElementEvents();
    $('#datetimepicker1').datetimepicker({
        format: 'HH:mm'
    });
    $('#datetimepicker2').datetimepicker({
        format: 'HH:mm'
    });
    $('#datetimepicker3').datetimepicker({
        format: 'HH:mm'
    });
    $('#datetimepicker4').datetimepicker({
        format: 'HH:mm'
    });
    $('#newwalldatetimepicker1').datetimepicker({
        format: 'HH:mm'
    });
    $('#newwalldatetimepicker2').datetimepicker({
        format: 'HH:mm'
    });
    $('#changeDeterminedTimepicker1').datetimepicker({
        format: 'HH:mm'
    });
    $('#changeDeterminedTimepicker2').datetimepicker({
        format: 'HH:mm'
    });

    var workspaceId=Util.getParameterByName('workspaceId');
    var userName = Util.getParameterByName('userName');
    if(workspaceId)
    {
      getWorkspace(userName, workspaceId);
      return;
    }
    else
    {
      getUser(userName,function(userFromService)
      {
          if(userFromService)
          {
            user = userFromService;
          }
          showNewWorkspaceForm();
      });
    }
  }
  
  var showNewWorkspaceForm = function()
  {
    $('#initialModal').modal(
    {
      backdrop: 'static',
      keyboard: false 
    });
    $('#initialModal').modal('show');
		showCurrentStep(currentStep);
  }
  
  var getUser = function(userName,callback)
  {
    if(!userName)
    {
      callback();
      return;
    }
    
    var data = {name: userName};
    var targetUrl = serviceUrl+"getUser";
    $.ajax({
      type: "POST",
      url:  targetUrl,
      data: data,
      success: function(response){
        if(response.message)
        {
          BootstrapDialog.alert(response.message);
          return;
        }
        
        callback(response.user);
      }
    });
  }
 
  // Çalışma alanının başlangıç ve bitiş zamanını açılıştaki elementlerden alarak start ve end değişkenlerine date olarak atar.
  var getWorkspaceTimers = function()
  {
    var startTime = $("#datetimepicker1").find("input").val();
    var endTime = $("#datetimepicker2").find("input").val();
    var timeItems = calculateTimeDifference(startTime,endTime);
    var differenceTotalMinutes = timeItems[0];
    var start =new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),timeItems[1],timeItems[2],0);
    var end = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),timeItems[3],timeItems[4],0); 
    return {start:start,end:end,differenceTotalMinutes:differenceTotalMinutes};
  }
  
  // Açılışta çıkan dialog daki .modal-step class ını kontrol edip aktif olan div i gösteriyor
	var showCurrentStep = function(currentStep)
	{
		$('.modal-step').hide();
		$('#step'+currentStep).show();
	}

  // Yeni duvar ekle butonuna bastığımızda çıkan dialog daki .modal-wallstep class ını kontrol edip aktif olan div i gösteriyor
  var showCurrentWallStep = function(currentWallStep)
	{
    $('.modal-wallstep').hide();
    $('#wallstep'+currentWallStep).show();
	}
	
  // Ekrana bir wall ekler
	var createDiv = function(wall)
	{
		if(wall.type=="dividedscreen")
		{
			createDividedScreen(wall);
		}
		else
    {
      createMediaScreen(wall);
    }
    
    $('#newWallModal').modal('hide');  
	}
  
  var createDividedScreen = function(wall)
  {
    var screenName = wall.id.replace("wall","Ekran");
    var numberOfScreens=($("#pageWidth").val() /$("#screenWidth").val())*($("#pageHeight").val()/$("#screenHeight").val());
    
    var workspaceDiv = "<br><div class='newScreen'><h2>"+screenName+"</h2><button type='button' class='btn btn-danger removeScreen'><span class='glyphicon glyphicon-trash'></span></button><button type='button' class='btn btn-default changeTime' data-toggle='modal' data-id='' href='#changeTimeModal'><span class='glyphicon glyphicon-time'></span></button><div id='"+wall.id+"' class='wall' style='width:100%;height:"+$("#pageHeight").val()+"px;zoom:13%;'></div>";
    document.getElementById('workspaceForm').innerHTML+=workspaceDiv;
    for(var i = 0; i<numberOfScreens;i++)
    {

      if(wall.screens)
      {
        if(wall.screens[i])
        {
          var playerScreenDiv = "<div id='"+wall.id+"_screen"+i+"'  class='wall_screen' style='width:"+$("#screenWidth").val()+"px;height:"+$("#screenHeight").val()+"px; background-image:url("+wall.screens[i].thumbnail+");background-repeat:no-repeat;background-size:cover;'></div>";
        }
        else
        {
          var playerScreenDiv = "<div id='"+wall.id+"_screen"+i+"' class='wall_screen' style='width:"+$("#screenWidth").val()+"px;height:"+$("#screenHeight").val()+"px;'></div>";
        }
      }
      else
      {
        var playerScreenDiv = "<div id='"+wall.id+"_screen"+i+"' class='wall_screen' style='width:"+$("#screenWidth").val()+"px;height:"+$("#screenHeight").val()+"px;'></div>";
      }
      document.getElementById(wall.id).innerHTML+=playerScreenDiv ;
    }
    document.getElementById(wall.id).innerHTML+="<br><br>";
  }
  
  var createMediaScreen = function(wall)
  {
    var screenName = wall.id.replace("wall","Ekran");
    var workspaceDiv = "<br><div class='newScreen'><h2>"+screenName+"</h2><button type='button' class='btn btn-danger removeScreen'><span class='glyphicon glyphicon-trash'></span></button><button type='button' class='btn btn-default changeTime' data-toggle='modal' data-id='' href='#changeTimeModal'><span class='glyphicon glyphicon-time'></span></button><div id='"+wall.id+"' class='wall' style='width:100%;height:"+$("#pageHeight").val()+"px;zoom:13%;'></div>";
    document.getElementById('workspaceForm').innerHTML+=workspaceDiv;
    var playerScreenDiv = "<div id='"+wall.id+"_screen' class='wall_screen media' style='width:"+$("#pageWidth").val()+"px;height:"+$("#pageHeight").val()+"px;'> <input id='"+wall.id+"_screen_file' type='file' class='file' name='image' style='display:none'/></div>";
    document.getElementById(wall.id).innerHTML+=playerScreenDiv ;
    document.getElementById(wall.id).innerHTML+="<br><br>";
  }
  
  var addSaveWorkspaceOnClick = function()
  {
    $(".saveButton").click(function()
    {
      $("#workspaceNameDialog").modal("show");
      if(workspaceObj.name)
      {
        $("#workspaceName").val(workspaceObj.name);
      }
    });
  }
  var addSaveWorkSpaceWithName = function ()
  {
    $("#saveWorkspaceName").click(function()
    {

      $("#workspaceNameDialog").modal("hide");
      var name = $("#workspaceName").val();
      var newWorkspaceObj = 
      {
        name:name ,
        starttime:$("#datetimepicker1").find("input").val(),
        endtime:$("#datetimepicker2").find("input").val(),
        width:$("#pageWidth").val(),
        height:$("#pageHeight").val(),
        walls:walls
      }
      var targetUrl = serviceUrl+"saveworkspace";
      workspaceObj=Util.mergeObjects(workspaceObj,newWorkspaceObj);
      var data = { workspace: workspaceObj};
      if(user)
      {
        targetUrl = serviceUrl+"saveuser";
        user = upsertWorkspaceToUser(workspaceObj, user);
        data = {  user:user };
      }
      
      $.ajax({
        type: "POST",
        url: targetUrl,
        data: data,
        success: function(response){
          if(response.workspaceId)
          {
            workspaceObj.workspaceId = response.workspaceId;
            if(user)
            {
              for(var i=0;i<user.workspaces.length;i++)
              {
                if(!user.workspaces[i].workspaceId)
                {
                  user.workspaces[i].workspaceId = response.workspaceId;
                }
              }
            }
          }
          BootstrapDialog.alert("Çalışma Alanı Başarıyla Kaydedildi.");
        },
        error: function(error){
          BootstrapDialog.alert("Hata: "+error.toString());
        }
      });
      console.log(workspaceObj);
    });
      
    }
 
  // Workspace div in içinde yer alan "Yeni duvar ekle" butonuna bastığımızda çalışan fonksiyon.
  var addNewWallOnClick = function()
  {
    $("#addNewWall").click(function()
    {
      $("#newWallModal").modal('show');
      showCurrentWallStep(currentWallStep);
    });
  }

  // Workspace div in içinde eklenen ekranlara bastığımızda çalışan fonksiyon.
  var addScreenOnClick = function()
  {
    $('#workspaceForm').on('click', '[class^=wall_screen]', function(e)
    {
      var id = this.id;
      if(e.target.className == "wall_screen media")
      {
        $(this).find('input[type="file"]').click();
        document.getElementById(id+"_file").addEventListener("change",function(e)
        {
            var mediaName = e.target.files[0].name;
            var video = '<video src="'+url+'"/"'+mediaName+'"></video>';
            $("#"+this.id).append(video)
        });
        
      }
      if(e.target.className == "wall_screen")
      {
        $('#screenConfigModal').modal(
        {
          backdrop: 'static',
          keyboard: false 
        });
        $('#screenConfigModal').modal('show');
        $("#wallScreenId").val(e.target.id);
        getAllTemplatesImages(e.target.id);
      }    
    });
  }
  
  //Şablon Dialogundaki Iframe i seçilen wall_screen e set eder.
  var addSaveWallScreen = function ()
  {
    $("#saveWallScreen").click(function()
    {
      var wallScreenId = $("#wallScreenId").val();
      $("#"+wallScreenId).empty();
      var iframe = document.getElementById('templateUrl').contentWindow.document.getElementsByTagName("html")[0];
      var iframeHtml = iframe.outerHTML;

      html2canvas(iframe, {
        onrendered: function(canvas) {
          // canvas is the final rendered <canvas> element
           var base64Pic = canvas.toDataURL('image/png');
           var thumbnailWidth = parseInt(canvas.width/4);
           var thumbnailHeight = parseInt(canvas.height/4);
           var thumbnail = imageToThumbnail(base64Pic,thumbnailWidth,thumbnailHeight);
     
          $("#"+wallScreenId).css("background-image","url("+thumbnail+")");
          var wallIndex = getWallIndex(wallScreenId);
          var screen = {
            id : wallScreenId,
            thumbnail : thumbnail,
            html : iframeHtml
          }
          var screenIndex = -1;
          if(!walls[wallIndex].screens)
          {
            walls[wallIndex].screens =[];
          }
          else
          {
            screenIndex = findScreenInWall(walls[wallIndex].screens,screen);
          }
          if(screenIndex===-1)
          {
            walls[wallIndex].screens.push(screen);  
          }
          else
          {
            walls[wallIndex].screens[screenIndex] = screen;
          }
          
          debugger;
          $('#screenConfigModal').modal('hide');
           
        }
      });
    });
  }
  
  var findScreenInWall = function (screens,screen)
  {
    for (var i=0;i<screens.length;i++)
    {
      if(screens[i].id===screen.id)
      {
        return i;
      }
    }
    
    return -1;
  }
  var getWallIndex = function (wallScreenId)  
  {
    var wallIndex = wallScreenId.split("_");
    var index = wallIndex[0].substr(wallIndex[0].length - 1);
    return index-1;
    
  }
  
  var imageToThumbnail = function(base64, maxWidth, maxHeight) {
    // Max size for thumbnail
    if(typeof(maxWidth) === 'undefined') var maxWidth = 500;
    if(typeof(maxHeight) === 'undefined') var maxHeight = 500;

    // Create and initialize two canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var canvasCopy = document.createElement("canvas");
    var copyContext = canvasCopy.getContext("2d");

    // Create original image
    var img = new Image();
    img.src = base64;

    // Determine new ratio based on max size
    var ratio = 1;
    if(img.width > maxWidth)
      ratio = maxWidth / img.width;
    else if(img.height > maxHeight)
      ratio = maxHeight / img.height;

    // Draw original image in second canvas
    canvasCopy.width = img.width;
    canvasCopy.height = img.height;
    copyContext.drawImage(img, 0, 0);

    // Copy and resize second canvas to first canvas
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
  }
  
  var addCloseWallScreen = function ()
  {
    $("#closeWallScreen").click(function()
    {  
      $('#screenConfigModal').modal('hide');
    });
  }
  
  //Şablon Dialogundaki Şablonlar Kısmındaki resimleri getirmeye yarar ve tıklandığında o sayfanın theme ini getirir.
  var getAllTemplatesImages = function (id) 
  {
    $('#templatesDiv').empty();
    for(var i = 1 ; i<5; i++)
    {  
      var img = " <label for='"+url+"/media/template"+i+".jpg'><input id='"+url+"/media/template"+i+".jpg' type='radio' name='type' value='theme"+i+".html'/><img src='"+url+"/media/template"+i+".jpg' class='screeniframe' style='margin-top:10px;width:100%'/></label>";
      $('#templatesDiv').append(img);
    }

    $('#templatesDiv input').on('change', function() {
       var templateUrl = $('input[name=type]:checked', '#templatesDiv').val();
       $("#templateUrl").css("width",$("#screenWidth").val()+"px");
       $("#templateUrl").css("height",$("#screenHeight").val()+"px");
       $("#templateUrl").css("transform-origin","0 0");
       $("#templateUrl").css("-webkit-transform","scale("+$("#screenConfigDiv").width()/$("#screenWidth").val()+")");
       $("#templateUrl").attr("class","")
       $("#templateUrl").attr("src",url+"themes/"+templateUrl)
       
    });
  }
  
 
  // Yeni Duvar Ekle butonuna bastığımızda çıkan ilk dialogdaki ekran tiplerinin bulunduğu dropdownlist.
  var addNewWallDropdownOnClick = function()
  {
    
    $('#screentypedropdown a').click(function(e) {
      $('#screentypedropdown a').removeClass('selected');
      $(this).addClass('selected');
    });
    
    $("#dropdownMenu2").on("click", "li a", function() {
      var platform = $(this).text();
      $('#platform').html(platform);
    });
  }
  
  //Yeni Duvar Ekledeki seçilen zamanın kontrollerini yapar.Örnegin yeni duvar için seçilen zaman aralığı çalışma alanının zaman aralığından büyük veya kullanılan bir zaman aralığı olamaz. 
  function getNewWallTimeSelectedTab ()
  {
    var newWallTime = 0;
    var $tab = $('#tabContent');
    var $active = $tab.find('.tab-pane.active');
    if($active[0].id==="determinedTime")
    {
      if($("#newwalldatetimepicker1").find("input").val()>=$("#newwalldatetimepicker2").find("input").val())
      {
        return false;
      }
      if($("#newwalldatetimepicker1").find("input").val()>=$("#datetimepicker2").find("input").val()||$("#newwalldatetimepicker2").find("input").val()>$("#datetimepicker2").find("input").val())
      {
        return false;
      }
      var startTime =$("#newwalldatetimepicker1").find("input").val();
      var endTime = $("#newwalldatetimepicker2").find("input").val();
      var checkUsedTimeFlag = checkUsedTime(startTime,endTime);
      if(checkUsedTimeFlag==false)
      {
        return false;
      }
      newWallTime = startTime+"-"+endTime;
    }
    else
    {
      newWallTime = $active.find('input').val();
    }
    return newWallTime;
  }
  
  //Seçilen zaman aralığının Timelineda kullanılıp kullanılmadığını kontrol eder.
  function checkUsedTime(startTime,endTime)
  {
    for(var i in walls)
    {
      if(walls[i].showTime.indexOf("-")>-1)
      {
        var wallShowTime = walls[i].showTime.split("-");
        var splitShowTime = splitStartAndEndTime(wallShowTime[0],wallShowTime[1])
        var splitNewWallShowTime = splitStartAndEndTime(startTime,endTime);
        if((splitShowTime.startTime<=splitNewWallShowTime.startTime && splitNewWallShowTime.startTime<splitShowTime.endTime)||(splitShowTime.startTime<splitNewWallShowTime.endTime && splitNewWallShowTime.endTime<=splitShowTime.endTime)||(splitShowTime.startTime==splitNewWallShowTime.startTime && splitShowTime.endTime==splitNewWallShowTime.endTime))
        {
          return false;
        }
      }
    }
    return true;
  }
  
  //Gönderilen başlangıç ve bitiş zamanını split eder
  function splitStartAndEndTime(startTime,endTime)
  {
    var splitStartTime = startTime.split(":");
    var splitEndTime = endTime.split(":");
    return{startTime:splitStartTime[0],endTime:splitEndTime[0],startTimeMinute:splitStartTime[1],endTimeMinute:splitEndTime[1]}
  }
  
  // Yeni Duvar Ekle butonunda çıkan dialogdaki en son next butonu.
  var applyNewWall = function()
  {   
      var screenType = $(".selected").attr('id') ;
      var newWallTime = getNewWallTimeSelectedTab();
      if(newWallTime===false)
      {
        BootstrapDialog.alert('Başlangıç zamanı bitiş zamanından büyük ve eşit olamaz');
         return;
      }
      if(newWallTime.length===0||newWallTime==="-")
      {
        BootstrapDialog.alert("Lütfen Ekranın Zamanını Giriniz");
        return;
      }
      var wallId = "wall"+(walls.length+1);
      if(walls.length>1)
      {
        var wallNumber = walls[walls.length-1].id.replace ( /[^\d.]/g, '' );
        wallId= "wall"+(parseInt(wallNumber)+1);
      }
      var wall = {
        id: wallId,
        type: screenType,
        showTime: newWallTime,
      }
      
      walls.push(wall);
      createDiv(wall);
      drawVisualization();
      currentWallStep=1;
  }    
  
  // Yeni Duvar Ekle butonunda çıkan dialogdaki back buttonu.
  var addNewWallModalBackOnClick = function()
  {  
    
    $(".backWallButton").click(function()
    {	
      currentWallStep=(--currentWallStep<0)?++currentWallStep:currentWallStep;
      showCurrentWallStep(currentWallStep);
    });
  }
  
  // Yeni Duvar Ekle butonunda çıkan dialogdaki next buttonu.
  var addNewWallModalNextOnClick = function()
  {
    $(".nextWallButton").click(function()
    {	
      
      if(++currentWallStep > numberOfWallSteps)
      {
        applyNewWall();
        return;
      }
      
      showCurrentWallStep(currentWallStep);
    });
  }
  var checkInitialModalValid = function()
  {
    if($("#datetimepicker1").find("input").val().length>0 
    && $("#datetimepicker2").find("input").val().length>0
    &&$("#pageWidth").val()%$("#screenWidth").val()==0&&$("#pageHeight").val()%$("#screenHeight").val()==0)
    {
      return true;
    }
  }

  // Açılışta çıkan dialogdaki en son gösterilen div deki next butonu.
  var addInitialModalApplyOnClick = function()
  {
    $("#submit").click(function()
    {
      if(checkInitialModalValid())
      {	
        var workspaceTimers = getWorkspaceTimers();
        self.start = workspaceTimers.start;
        self.end = workspaceTimers.end;
        self.differenceTotalMinutes = workspaceTimers.differenceTotalMinutes;
        $("#initialModal").modal('hide');
      }
      else
        BootstrapDialog.alert("Eksik veya Yanlış Bilgi Giriniz")
    });
  }
  
	// Açılışta çıkan dialogdaki back butonu.
  var addInitialModalNextOnClick = function()
  {
    $(".nextButton").click(function()
    {	
      currentStep=(++currentStep>numberOfSteps)?--currentStep:currentStep;
      showCurrentStep(currentStep);
    });
  }
  
	// Açılışta çıkan dialogdaki back butonu
  var addInitialModalBackOnClick = function()
  {
    $(".backButton").click(function()
    {	
      currentStep=(--currentStep<0)?++currentStep:currentStep;
      showCurrentStep(currentStep);
    });
  }
  var addManagerPageButtonOnClick = function()
  {
    $("#managerPageButton").click(function()
    {	
      window.location.href = url+"manager.html";
      return;
    });
  }  
  // Keyup Function = Sayfada çıkan ikinci dialog da Workspace ve Ekranların width-height modunu alıp kontrol ediyor.
  var addPageValidationControls = function()
  {
    $('#secondForm').formValidation(
    {
        framework: 'bootstrap',
        icon: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            screenWidth: {
                validators: {
                    callback: {
                       callback: function (value, validator, $field) 
                                {
                                  var sum   = $("#pageWidth").val()%value;
                                  if(sum==0)
                                  {
                                    $("#screenWidth").css("border","1px solid green");
                                    return{valid:true,	message: 'Genişlik Ekran Boyutunun Tam Katı'};
                                  }
                                  else
                                  {
                                    $("#screenWidth").css("border","1px solid red");
                                    return{valid:false,	message: 'Genişlik Ekran Boyutunun Tam Katı Olmalı'};
                                  }
                                  return true;
                                }
                              }
                            }
                          },
          screenHeight: {
                validators: {
                    callback: {
                        callback: function (value, validator, $field) 
                                {
                                  var sum   = $("#pageHeight").val()%value;
                                  if(sum==0)
                                  {
                                    $("#screenHeight").css("border","1px solid green");
                                    return{valid:true,	message: 'Yükseklik Ekran Boyutunun Tam Katı'};
                                  }
                                  else
                                  {
                                    $("#screenHeight").css("border","1px solid red");
                                    return{valid:false,	message: 'Yükseklik Ekran Boyutunun Tam Katı Olmalı'};
                                  }
                                  return true;
                                }
                              }
                            }
                        }
                }
    });
  }
  
  //Dialoglarda girilen oynama süresinin belirlendiği tabları gösterir.
  var addScreenTimerTabs = function()
  {
    $(".nav-tabs a").click(function(){
        $(this).tab('show');
    });
  }
  
  //Kullanıcının id ile verilen workspace' ini bulur.
  findUserWorkspace = function(workspaceId,workspaces)
  {
    for(var i = 0; i<workspaces.length;i++)
    {
      if(workspaceId === workspaces[i].workspaceId)
      {
        return workspaces[i];
      }
    }
    
    return null;
  }
  
  // Kullanıcının workspace ini değiştirir. Id ile doğru workspace i bulur değiştirir ve workspace' i değişmiş user döndürür.
  upsertWorkspaceToUser = function(workspace,user)
  {
    var found = false;
    if(!user.workspaces)
    {
      user.workspaces = [workspace];
      return user;
    }
    
    for(var i = 0; i<user.workspaces.length;i++)
    {
      if(workspace.workspaceId === user.workspaces[i].workspaceId)
      {
        user.workspaces[i] = workspace;
        found = true;
      }
    }
    
    if(!found)
    {
      user.workspaces.push(workspace);
    }
    
    return user;
  }
  
  // Sayfada bulunan elementlerin onclick, validate gibi olaylarının set edilmesini sağlar.
  var setHtmlElementEvents = function()
  {
    addPageValidationControls();
    addSaveWorkspaceOnClick();
    addScreenOnClick();
    addRemoveScreenOnClick();
    addChangeTimeOnClick();
    addChangeTimeApply();
    addNewWallOnClick();
    addNewWallModalNextOnClick();
    addNewWallModalBackOnClick();
    addNewWallDropdownOnClick();
    addInitialModalApplyOnClick();
    addInitialModalNextOnClick();
    addInitialModalBackOnClick();
    addScreenTimerTabs();
    addManagerPageButtonOnClick();
    addSaveWorkSpaceWithName();
    addSaveWallScreen();
    addCloseWallScreen();
  }
  
 	var self=this;
};

$( document ).ready(function() 
{	 
  var wallManager = new WallManager();
  wallManager.initialize();
});