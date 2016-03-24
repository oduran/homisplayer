// Duvar ekleme çıkarma timeline fonksiyonlarını içeren yönetici sınıf.
var Workspace = function () {
  
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
  var wallscreens= [];
  var currentUserToEdit;
  var selectedMenu=0;
  var userVideoresources="";
  var userClasses="";
  var videoresources = "";
  
  if(!accessToken)
  {
    window.location.href = url+"login.html";
    return;
  }
  
  /**
  * Set edilen baslangıç ve bitiş zamanlarının arasındaki dakika farkını bulan fonksiyon. Burada startTime ve endTime da set ediliyor.
  * @params {string} startTime - Başlangıç zamanı.
  * @params {string} endTime - Bitiş zamanı.
  * @returns {Array} - Başlangıç zamanı saat-dakika, Bitiş zamanı saat-dakika
  */
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
  };

  /**
  * Timeline datarow çizimi sağlıyor.
  */
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
  };
  
  /**
  * Duvarların oynama süresine göre timeline'da row oluşturur
  * @returns {Array} - Timeline row
  */
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
        
      }while(timeDifference[0]>totalSpentTime&&totalSpentTime!==0);
    }
  
    for(var a=0 ; a<timedWalls.length;a++)
    {
      var determinedTime = splitDeterminedShowTime(timedWalls[a].showTime);
      rows.push(["Zaman Çizelgesi", timedWalls[a].id.replace("wall","ekran"), determinedTime.startTime, determinedTime.endTime]);
    }
  
    return rows;
  };
  
  /**
  * Zamanları büyükten küçüğe sıralar.
  * @params {array}- Karşılaştırılan ilk objenin başlangıç zamanı
  * @params {array}- Karşılaştırılan ikinci objenin başlangıç zamanı
  * @returns {0} - Büyükten küçüğe sıralanmış hali.
  */
  var sortDividedTime = function (date1, date2)
  {
    if (date1.startTime > date2.startTime) return 1;
    if (date1.startTime < date2.startTime) return -1;
    return 0;
  };
  
  /**
  * Return Çalışma alanının zamanını eklenen yeni çalışma alanlarına göre böler.
  * @params object workspaceTime - Çalışma alanının zamanı.
  * @params {array} timedWalls - Zamanı belli olan duvarlar
  * @returns {array} - Çalışma alanının zamanını eklenen yeni çalışma alanlarına göre böler.
  */
  var divideTime = function(workspaceTime,timedWalls)
  { 

    var dividedArray=[];
    var timePart={startTime:workspaceTime.startTime};
    var determinedArray =[];
    if(timedWalls.length===0)
    { 
      return [{startTime:stringToDate($("#datetimepicker1").find("input").val()),endTime:stringToDate($("#datetimepicker2").find("input").val())}];
    }
    
    for(var i=0;i<timedWalls.length;i++)
    { 
      var determinedTime = splitDeterminedShowTime(timedWalls[i].showTime);
      determinedArray.push(determinedTime);
      determinedArray.sort(sortDividedTime);
    }

    for(var t=0;t<determinedArray.length;t++)
    { 
      timePart.endTime=determinedArray[t].startTime;
      if(timePart.startTime.toString() !== timePart.endTime.toString())
      {
        dividedArray.push(timePart);
      }
      
      timePart={startTime:determinedArray[t].endTime};
    } 
    timePart.endTime = workspaceTime.endTime;
    dividedArray.push(timePart);
  
    return dividedArray;
  };

  /**
  * Return  Belirlenen sürenin dakika saat ve başlangıç-bitiş zamanını ayırır.
  * @params {string} determinedTimeString - Belirlenmiş zaman.
  * @returns object - Belirlenen sürenin dakika saat ve başlangıç-bitiş zamanını ayırır..
  */
  var splitDeterminedShowTime = function (determinedTimeString)
  {
    var splitTimer = determinedTimeString.split("-");
    return {startTime:stringToDate(splitTimer[0]),endTime:stringToDate(splitTimer[1])};
  };
  
  /**
  * Return  Gelen Stringi Date e çevirir.
  * @params {string} dateString - Zamanın string hali.
  * @returns {date} - Gelen Stringi Date e çevirir.
  */
  var stringToDate = function(dateString)
  {
    var splittedTime = dateString.split(":");
    var hour = splittedTime[0];
    var minute = splittedTime[1];
    var time = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),hour,minute,0);
    return time;
  };
  
  /**
  * Workspace halihazırda varsa ekrana servisten gelen workspace objesinde belirlenmiş olan duvarları ekler.
  * @params {string} userName - Kullanıcı adı.
  * @params {string} workspaceId - Çalışma alanı id si.
  */
  var getWorkspace = function(userName, workspaceId)
  {
    Util.loadingDialog.show();
    var targetUrl = serviceUrl+"getworkspace";
    var data = {  workspaceId: workspaceId};
    
    if(userName)
    {
      $("#workspaceHeader").text( userName.toUpperCase()+ "'in Çalışma Alanı");
      data.name = userName;
    }

    $.ajax({
      type: "POST",
      url:  targetUrl,
      data: data,
      success: function(response){
        Util.loadingDialog.hide();
        
        if(response.message)
        {
          return;
        }
        
        workspaceObj = response;
        $( "#pageHeight" ).val(workspaceObj.height);
        $( "#pageWidth" ).val(workspaceObj.width);
        $("#datetimepicker1").find("input").val(workspaceObj.starttime);
        $("#datetimepicker2").find("input").val(workspaceObj.endtime);
        var workspaceTimer = splitStartAndEndTime(workspaceObj.starttime,workspaceObj.endtime);
        self.start = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),workspaceTimer.startTime,workspaceTimer.startTimeMinute,0);
        self.end = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),workspaceTimer.endTime,workspaceTimer.endTimeMinute,0);

        for(var i = 0 ; i<workspaceObj.walls.length ;i++)
        {
          var wall = {
          id: workspaceObj.walls[i].id,
          type: workspaceObj.walls[i].type,
          showTime: workspaceObj.walls[i].showTime,
          screens:[]
          };
          
          var screens = {
          screens :  workspaceObj.walls[i].screens,
          };
          wallscreens.push(screens);
          walls.push(wall);
          createDiv(wall);
          drawVisualization();
        }
     setScreenThumbnailImage();
       
          
      },
      error: Util.handleAjaxError
    });
  }; 
  
  /**
  * Return Eklenen duvarın çalışma zamanını değiştirdiğimizdeki çalışan fonksiyon.
  * @returns {string} newWallTime - Değiştirilen yeni zaman.
  */
  var getNewWallUpdateTimeSelectedTab = function  ()
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
      
      if(checkUsedTimeFlag===false)
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
  };
  
  /**
  * Eklenen duvarların sağ üst köşesinde bulunan saat ikonuna tıklandığında çalışan fonksiyon.
  */
  var addChangeTimeApply = function()
  {
    $("#changeTimeApply").click(function()
    {
      for (var i in walls) 
      {
       if (walls[i].id == $("#changeTimeScreenName").val()) 
       {  
        walls[i].showTime ="-";
        var newMinutes = getNewWallUpdateTimeSelectedTab();
        
        if(newMinutes===false)
        {
          Util.handleAjaxError("Girdiğiniz zaman aralığı kullanılmaktadır.");
          return false;
        }
        
        walls[i].showTime =newMinutes;
        drawVisualization();
        break; //Stop this loop, we found it!
       }
      }
      
      $('#changeTimeModal').modal('hide');
    });
  };
 
  /**
  * Ekran zamanını değiştirmeye yarayan fonksiyon.
  */
  var addChangeTimeOnClick = function () 
  {
    $(document).on("click", ".changeTime", function () 
    {
      var wallId = $(this).parent().find('h2').html();
      var screenName = wallId.replace("Ekran","wall");
      $("#changeTimeScreenName").val(""+screenName);
      for(var i=0;i<walls.length;i++)
      {
        if(walls[i].id == screenName)
        {
          if(walls[i].showTime.indexOf("-")>0)
          {
           $('.nav-tabs a[href="#changeDeterminedTime"]').tab('show');
           $("#changeDeterminedTimepicker1 input").val(walls[i].showTime.split("-")[0]); 
           $("#changeDeterminedTimepicker2 input").val(walls[i].showTime.split("-")[1]);
          }
          
          else
          {
           $('.nav-tabs a[href="#changePeriodicTime"]').tab('show');
           $("#changeNewWalltimer").val(walls[i].showTime);
          }
         }
      }
    });
  };
  
  /**
  * Ekranı silmeye yarayan fonksiyon.
  */
  var addRemoveScreenOnClick = function () 
  {
   $(document).on('click', '.removeScreen', function()
    {  
      var wallId = $(this).parent().find('h2').html();
      var removeItem = wallId.replace("Ekran","wall");
      var screenName = wallId.replace(/[0-9]/g, '');
      for(var i=0;i<walls.length;i++)
      {
        if(walls[i].id === removeItem)
        {
          walls.splice(i,1);
        }
      }
      
      for(var i=0;i<walls.length;i++)
      {
        if(walls[i].id === removeItem)
        {
          walls.splice(i,1);
        }
      }
      
      $(this).parent().remove();
      $(".newScreen").each(function(index)
      {
        var screenName = $(this).find("h2").html().replace(/[0-9]/g,index+1);
        $(this).find("h2").html(screenName);
        var wall = walls[index] ;
        var parentId = "wall"+(index+1);
        walls[index].id = parentId;
        $(this).find("ul").attr("id",parentId);
        $(this).find("ul li").each(function(listIndex)
        {
          if(wall.screens[listIndex])
          {
            wall.screens[listIndex].id = parentId+"_screen"+listIndex;
            $(this).attr("id",parentId+"_screen"+listIndex);
          }
        })
      });
      drawVisualization();
    });
  };
   
  /**
  * Başlangıçta çalışma alanı, ekran büyüklüklerinin girilebileceği modal penceresinin açılmasını sağlar ve sürükle bırak objelerini set eder.
  */
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
      if(!userName)
      {
        showNewWorkspaceForm();
        return;
      }
      
      getUser(userName,function(userFromService)
      {
        var username = "";
        if(userFromService)
        {
          currentUserToEdit = userFromService;
        }
        if(!currentUserToEdit)
        {
         $("#workspaceHeader").text("Çalışma Alanı");
        }
        else
        {
         $("#workspaceHeader").text(currentUserToEdit.name.toUpperCase()+"'in Çalışma Alanı"); 
        }
        
        showNewWorkspaceForm();
      });
    }
  };
  
  /**
  * Kullanıcının çalışma alanı yoksa ekranda ilk açılan dialog.
  */
  var showNewWorkspaceForm = function()
  {
    $('#initialModal').modal(
    {
      backdrop: 'static',
      keyboard: false 
    });
    $('#initialModal').modal('show');
		showCurrentStep(currentStep);
  };
   
  /**
  * Kullanıcı isme göre çağrıan fonksiyon.
  * @params {string} userName - Kullanıcı adı.
  * @params function callback 
  * @returns {user} - response dan gelen user objesini döndürür. 
  */
  var getUser = function(userName,callback)
  {
    var data = {name: userName};
    if(!userName)
    {
      data = {};
    }
    
    var targetUrl = serviceUrl+"getUser";
    $.ajax({
      type: "POST",
      url:  targetUrl,
      data: data,
      success: function(response)
      {
        
        if(response.message)
        {
          Util.handleAjaxSuccess(response.message);
          return;
        }
        
        callback(response.user);
      },
      error:Util.handleAjaxError
    });
  };
 
  /**
  * Çalışma alanının başlangıç ve bitiş zamanını açılıştaki elementlerden alarak start ve end değişkenlerine date olarak atar.
  * @returns object - Başlangıç zamanı, bitiş zamanı, başlangıç-bitiş zamanı arasındaki fark. 
  */
  var getWorkspaceTimers = function()
  {
    var startTime = $("#datetimepicker1").find("input").val();
    var endTime = $("#datetimepicker2").find("input").val();
    var timeItems = calculateTimeDifference(startTime,endTime);
    var differenceTotalMinutes = timeItems[0];
    var start =new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),timeItems[1],timeItems[2],0);
    var end = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),timeItems[3],timeItems[4],0); 
    return {start:start,end:end,differenceTotalMinutes:differenceTotalMinutes};
  };
  
  /**
  * Açılışta çıkan dialog daki .modal-step class ını kontrol edip aktif olan div i gösteriyor
  * @params {string} currentStep - İlk açılan çalışma alanı oluştur dialogundaki step numarası.
  */
	var showCurrentStep = function(currentStep)
	{
		$('.modal-step').hide();
		$('#step'+currentStep).show();
	};

  /**
  * Yeni duvar ekle butonuna bastığımızda çıkan dialog daki .modal-wallstep class ını kontrol edip aktif olan div i gösteriyor
  * @params {string} currentWallStep - İlk açılan çalışma alanı oluştur dialogundaki step numarası.
  */
  var showCurrentWallStep = function(currentWallStep)
	{
    $('.modal-wallstep').hide();
    $('#wallstep'+currentWallStep).show();
	};
	
  /**
  * Ekrana bir wall ekler
  * @params {wall} wall objesi - gelen wall objesine göre media mı bölünmüş ekran mı olduğunu kontrol eder.
  */
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
	};
  
  /**
  * Bölünmüş ekran ekleyen fonksiyon.
  * @params {wall} wall objesi - gelen wall objesine ekranı oluşturur.
  */
  var createDividedScreen = function(wall)
  {
    var screenName = wall.id.replace("wall","Ekran");
    var numberOfScreens=($("#pageWidth").val() /$("#screenWidth").val())*($("#pageHeight").val()/$("#screenHeight").val());
    var playerScreenDiv="";
    var workspaceDiv = checkHorizontalOrVerticalScreen(screenName,wall);    
    document.getElementById('workspaceForm').innerHTML+=workspaceDiv;
    for(var i = 0; i<numberOfScreens;i++)
    {

      if(wall.screens)
      {
        if(wall.screens[i])
        {
          playerScreenDiv = "<li id='"+wall.id+"_screen"+i+"'  class='wall_screen' style='width:"+$("#screenWidth").val()+"px;height:"+$("#screenHeight").val()+"px; background-image:url("+wall.screens[i].thumbnail+");background-repeat:no-repeat;background-size:cover;'></li>";
        }
        else
        {
          playerScreenDiv = "<li id='"+wall.id+"_screen"+i+"' class='wall_screen' style='width:"+$("#screenWidth").val()+"px;height:"+$("#screenHeight").val()+"px;'></li>";
        }
      }
      
      else
      {
        playerScreenDiv = "<li id='"+wall.id+"_screen"+i+"' class='wall_screen' style='width:"+$("#screenWidth").val()+"px;height:"+$("#screenHeight").val()+"px;'></li>";
      }
      
      document.getElementById(wall.id).innerHTML+=playerScreenDiv ;
    }
    
    document.getElementById(wall.id).innerHTML+="<br><br>";
  };

  /**
  * Video ve resim duvarı ekleyen fonksiyon.
  * @params {wall} wall objesi - gelen wall objesi ile medya ekranı oluşturur.
  */
  var createMediaScreen = function(wall)
  {
    var screenName = wall.id.replace("wall","Ekran");
    var workspaceDiv = checkHorizontalOrVerticalScreen(screenName,wall);    
    document.getElementById('workspaceForm').innerHTML+=workspaceDiv;
    var playerScreenDiv = "<li id='"+wall.id+"_screen' class='wall_screen "+wall.type+"' style='width:"+$("#pageWidth").val()+"px;height:"+$("#pageHeight").val()+"px;'></li>";
    document.getElementById(wall.id).innerHTML+=playerScreenDiv ;
    document.getElementById(wall.id).innerHTML+="<br><br>";
  };
 
  /**
  * Çalışma alanını kaydete bastığımızda çalışan fonksiyon.
  */
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
  };
 
  /**
  * Çalışma alanının ismini girilen yerdeki kaydet butonu.
  */
  var addSaveWorkSpaceWithName = function ()
  {
    $("#saveWorkspaceName").click(function()
    {
      if($("#workspaceName").val().length===0)
      {
        Util.handleAjaxError("Çalışma Alanının adı boş girilmemelidir!");
        return;
      }
      $("#workspaceNameDialog").modal("hide");
      Util.loadingDialog.show();
      var name = $("#workspaceName").val();
      var newWorkspaceObj = 
      {
        name:name ,
        starttime:$("#datetimepicker1").find("input").val(),
        endtime:$("#datetimepicker2").find("input").val(),
        width:$("#pageWidth").val(),
        height:$("#pageHeight").val(),
        walls:walls
      };
      
      var targetUrl = serviceUrl+"saveworkspace";
      workspaceObj=Util.mergeObjects(workspaceObj,newWorkspaceObj);
      var data = { workspace: workspaceObj};
      var userName = Util.getParameterByName('userName');
      if(userName)
      {
        data.name = userName;
      }
      
      $.ajax({
        type: "POST",
        url: targetUrl,
        data: data,
        success: function(response){
          if(response.workspaceId)
          {
            workspaceObj.workspaceId = response.workspaceId;
            if(currentUserToEdit && currentUserToEdit.workspaces)
            {
              for(var i=0;i<currentUserToEdit.workspaces.length;i++)
              {
                if(!currentUserToEdit.workspaces[i].workspaceId)
                {
                  currentUserToEdit.workspaces[i].workspaceId = response.workspaceId;
                }
              }
            }
          }
          
          Util.loadingDialog.hide();
          Util.handleAjaxSuccess(response.message);
        },
        error: Util.handleAjaxError
      });
    });
  };
 
  /**
  * Workspace div in içinde yer alan "Yeni duvar ekle" butonuna bastığımızda çalışan fonksiyon.
  */
  var addNewWallOnClick = function()
  {
    $("#addNewWall").click(function()
    {
      $("#newWallModal").modal('show');
      showCurrentWallStep(currentWallStep);
    });
  };

  /**
  * Workspace div in içinde eklenen ekranlara bastığımızda çalışan fonksiyon.
  */
  var addScreenOnClick = function()
  {
    $('#workspaceForm').on('click', '[class^=wall_screen]', function(e)
    {
      var id = this.id;
  
      if(e.target.className == "wall_screen videowall")
      {
        $("#videoModal").modal("show");
        $("#media").val(e.target.id);
        getUserResources("video");
      }
      
      if(e.target.className == "wall_screen imagewall")
      {
        $("#videoModal").modal("show");
        $("#media").val(e.target.id);
        getUserResources("image");
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
  };
  
  /** Usera ait medya objelerini ekrana bastırılmasına yarayan fonksiyon.
  *@params object user - Usera ait media kaynaklarını çekmek için kullanılır.
  *@params {string} mediaType - Usera ait media kaynaklarını çekmek için kullanılır.
  */
  var getUserResources = function (mediaType)
  {
    var userName = Util.getParameterByName('userName');
    getUser(userName,function(user){
      if(!user.mediaResources)
      {
        return;
      }
      for(var i = 0 ;i<user.mediaResources.length; i++)
      {
        var videoFileCheck = (user.mediaResources[i].fileType === mediaType) ? true : false;
        if(videoFileCheck)
        {
          var mediaUrl = url + user.mediaResources[i].url;
          var mediaThumbnail = user.mediaResources[i].thumbnailUrl;
          var resourceName = mediaUrl.substr(mediaUrl.lastIndexOf('/') + 1);
          var mediaResourceName = "<option value='"+mediaUrl+"' class='"+mediaThumbnail+"' id='"+resourceName+"_userMedia' >"+resourceName+"</option>";
          $("#onUserVideoResources").append(mediaResourceName); 
        }
      }
    });
    
  };
  
  /**
  * Resim değiştirme dialogunda sol tarafa atılmak istenen resimleri atayan button.
  */
  var addMoveLeftButtonClick = function()
    {
      $("#moveLeftMedia").click(function()
      {
        if(selectedMenu===1)
        {
          for(var i =0 ; i<userVideoresources.length;i++)
          {
            var resourceName = userVideoresources[i].substr(userVideoresources[i].lastIndexOf('/') + 1);
            var option = "<option value='"+userVideoresources[i]+"' class='"+userVideoClasses+"' id='"+resourceName+"_iframe'>"+resourceName+"</option>";
            $("#onUserVideoResources option[id='"+resourceName+"_userMedia']").remove();
            $("#videoResources").append(option);
          }
         }
      });
    }
  
  /**
  * Resim değiştirme dialogunda sağ tarafa atılmak istenen resimleri atayan button.
  */
  var addMoveRightButtonClick = function()
  {
    $("#moveRightMedia").click(function()
    {
      if(selectedMenu===2)
      {
        for(var i =0 ; i<videoresources.length;i++)
        {
          var resourceName = videoresources[i].substr(videoresources[i].lastIndexOf('/') + 1);
          var option = "<option value='"+videoresources[i]+"' class='"+userVideoClasses+"' id='"+resourceName+"_userMedia'>"+resourceName+"</option>";
          $("#videoResources option[id='"+resourceName+"_iframe']").remove();
          $("#onUserVideoResources").append(option);
        }
       }
    });
  }
  
  /**
  * Resim değiştirme dialogunda seçilen resimlerin bilgilierini tutan fonksiyon.
  */
  var addOptionOnChange = function () 
  {
  $('#onUserVideoResources').on('change',function()
    { 
      selectedMenu=1;
      userVideoresources=$(this).val();
      userVideoClasses=$(this).find("option").attr('class');
    }); 
  $('#videoResources').on('change',function()
    { 
      selectedMenu=2;
      videoresources=$(this).val();
     });    
  }
    
  /**
  * Şablon Dialogundaki Iframe i seçilen wall_screen e set eder.
  */
  var addSaveWallScreen = function ()
  {
    $("#saveWallScreen").click(function()
    {
      Util.loadingDialog.show();
      var wallScreenId = $("#wallScreenId").val();
      $("#"+wallScreenId).empty();
      var checkScreenMedia = document.getElementById('templateUrl').src;
      var iframe = document.getElementById('templateUrl').contentWindow.document.getElementsByTagName("html")[0];
      var iframeHtml = iframe.outerHTML;
      if(checkScreenMedia.indexOf("twitter")>-1)
      {
        iframeHtml = checkScreenMedia;
      }
      html2canvas(iframe, {
        onrendered: function(canvas) 
        {
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
          };
          
          saveScreenToWall(screen,wallIndex);
          
          Util.loadingDialog.hide();
          $('#templateUrl').attr('src','');
          $('#templateUrl').attr('srcdoc','');
          $('#screenConfigModal').modal('hide');
        }
      });
    });
  };
   
  /**
  * Ekranın id'siyle duvarın içindeki ekranın id'sini kontrol eden fonksiyon.
  * @params {array} screens - Ekranların tutulduğu array
  * @params object screen - Seçilen ekran objesi
  * @returns {int} i - Bulunan ekranın indexini döndürür.
  */
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
  };
  
  /**
  * Duvarın index'ini alan fonksyion.
  * @params {string} wallScreenId - Ekranın id si
  * @returns {int} index-1 - Ekranın içindeki duvarları bulmak için alınan indexi döndürür.
  */
  var getWallIndex = function (wallScreenId)  
  {
    var wallIndex = wallScreenId.split("_");
    var index = wallIndex[0].substr(wallIndex[0].length - 1);
    return index-1;
  };
  
  /**
  * Image i thumbnaile çeviren fonksiyon.
  * @params {array} base64 - image'in dataURL i
  * @params {int} maxWidthImg - Oluşturulacak thumbnailin width'i
  * @params {int} maxHeightImg - Oluşturulacak thumbnailin height'i
  * @returns {array} canvas.toDataURL - Thumbnail image'in dataUrli.
  */
  var imageToThumbnail = function(base64, maxWidthImg, maxHeightImg) {
    // Max size for thumbnail
    if(typeof(maxWidthImg) === 'undefined') var maxWidth = 500;
    if(typeof(maxHeightImg) === 'undefined') var maxHeight = 500;

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
    if(img.width > maxWidthImg)
      ratio = maxWidthImg / img.width;
    else if(img.height > maxHeightImg)
      ratio = maxHeightImg / img.height;

    // Draw original image in second canvas
    canvasCopy.width = img.width;
    canvasCopy.height = img.height;
    copyContext.drawImage(img, 0, 0);

    // Copy and resize second canvas to first canvas
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.5);
  };
   
  /**
  * Ekranı düzenle dialogunu kapatır..
  */
  var addCloseWallScreen = function ()
  {
    $("#closeWallScreen").click(function()
    {  
      $('#templateUrl').attr('srcdoc','');
      $('#templateUrl').attr('src','');
      $('#screenConfigModal').modal('hide');
    });
  };
  
  /** Şablon Dialogundaki Şablonlar Kısmındaki resimleri getirmeye yarar ve tıklandığında o sayfanın theme ini getirir.
  * @params {int} id - Workspace.htmlde oluşturulan ekranlarda kaçıncı duvarın seçildiğini getiren id.
  */
  var getAllTemplatesImages = function (id) 
  {
    $('#templatesDiv').empty();
    for(var i = 1 ; i<6; i++)
    {  
      var img = " <label for='"+url+"media/template"+i+".jpg'><input id='"+url+"media/template"+i+".jpg' type='radio' name='type' value='theme"+i+".html'/><img src='"+url+"media/template"+i+".jpg' class='screeniframe' style='margin-top:10px;width:100%'/></label>";
      $('#templatesDiv').append(img);
    }
    var wallIndex = getWallIndex(id);

    $("#templateUrl").removeAttr("srcdoc");

    $('#templatesDiv input').on('change', function() 
    {
       $("#templateUrl").removeAttr("srcdoc");
       var templateUrl = $('input[name=type]:checked', '#templatesDiv').val();
       $("#templateUrl").css("width",$("#screenWidth").val()+"px");
       $("#templateUrl").css("height",$("#screenHeight").val()+"px");
       $("#templateUrl").css("transform-origin","0 0");
       $("#templateUrl").css("-webkit-transform","scale("+$("#screenConfigDiv").width()/$("#screenWidth").val()+")");
       $("#templateUrl").attr("class","");
       if($(this).val()==="theme5.html"||$(this).val()==="theme4.html")
       {
         $("#templateUrl").attr("src","");
         setSocialMediaProperties(templateUrl);
         return;
       }
       $("#templateUrl").attr("src",url+"themes/"+templateUrl);
    });
    
    if(walls[wallIndex].screens)
    {
      getSelectedScreenHtml(wallIndex,id);
    }
  };
  
  /** Sosyal medya(raspberry) için kullanılan ekranın twitter swarm ayarlarının yapıldığı fonksiyon
  * @params {string} templateUrl - Kullanıcı dialogta çıkan bilgileri girdikten sonra templateUrl e gitmesi için gönderilir.
  */
  var setSocialMediaProperties = function(templateUrl)
  {
     BootstrapDialog.show({
            title: 'Medya Ayarları',
            message: $('<input id="twitterIdInput" class="form-control" placeholder="TwitterId Giriniz" value=689785930517970944></input><br>'+
                       '<input id="twitterNameInput" class="form-control" placeholder="Twitter İsmini Giriniz" value=deliganspub></input><br>'+
                       '<input id="swarmVenueId" class="form-control" placeholder="Swarm Venue Id" value = 56a8999b498e6d9f0d8add0c></input><br>'+
                       '<input id="swarmOauthToken" class="form-control" placeholder="Swarm OAuthToken" value=A5P5WIBWXDOX5PJRMWL3NDI2LVQX2HVJQBAC0CZHMS2RIM15></input><br>'+
                       '<label>Kullanılacak Sosyal Medya Kaynağı</label><select class="mediatype" name="mediaType">'+createOptionStrings("instagram")+'</select><br>'),
            buttons: [{
                label: 'Kaydet',
                cssClass: 'btn-primary',
                hotkey: 13, // Enter.
                action: function(dialog) {
                  appConfig.twitterId = $("#twitterIdInput").val();
                  appConfig.twitterName = $("#twitterNameInput").val();
                  appConfig.sliderMedia = $(".mediatype").val();
                  console.log($(".mediatype").val());
                  appConfig.swarmVenueId = $("#swarmVenueId").val();
                  appConfig.swarmOauthToken = $("#swarmOauthToken").val();
                  dialog.$modal.modal('hide');
                 
                  $("#templateUrl").attr("src","themes/"+templateUrl+"?twitterId="+appConfig.twitterId+
                                                            "&twitterName="+appConfig.twitterName+
                                                            "&sliderMedia="+appConfig.sliderMedia+
                                                            "&swarmVenueId="+appConfig.swarmVenueId+
                                                            "&swarmOauthToken="+appConfig.swarmOauthToken);
                
                  }
            }]
        });
  }
  
  /** Sosyal medya(raspberry) için kullanılan ekranın kullanılacak sosyal medya kaynağının seçimi yapılması için combobox oluşturur.
  */
  var createOptionStrings = function(socialMedia)
  {
    var optionsString = "";
    var mediaTypes = ["instagram","twitter"];
    for(var i=0;i<mediaTypes.length;i++)
    {   
      var stringAddition = (mediaTypes === mediaTypes[i])? "selected":"";
      optionsString += "<option value='"+mediaTypes[i]+"' "+stringAddition+">"+mediaTypes[i]+"</option>";
    }
    
    return optionsString;
  };
  
  /** Şablon Dialogunda editlenen theme'i kaydettiğimizde ordaki ekranın görüntüsünü alıp ekrandaki duvara kaydeden fonksiyon. 
  */
  var setScreenThumbnailImage = function ()
  {
    for(var i = 0 ; i<wallscreens.length;i++)
    {
      
      if(wallscreens[i].screens)
      {
       
        for(var j = 0 ; j<wallscreens[i].screens.length ; j++)
        {
          var screen = wallscreens[i].screens[j];
          $("#"+screen.id).css("background-image","url("+screen.thumbnail+")");
          walls[i].screens.push(screen);  
        }
      }
    }
  };
  
  /** Duvarda seçilen ekranının html'ini gösterir.
  * @params {int} wallIndex - Seçilen duvarın index'i (kaçıncı duvarın seçildiğinin bilgisini tutar).
  * @params {int} id - Seçilen ekranın id'si(Duvarın içindeki hangi ekranın editlendiğini anlamak için tutulur).
  * @returns {boolean} true|false - Duvarda seçilen ekranın html'i varsa true yoksa  false döndür.
  */
  var getSelectedScreenHtml = function (wallIndex,id)
  {
    var screens = walls[wallIndex].screens;
    
    for(var i=0;i<screens.length;i++)
    {
      if(screens[i].id===id)
      {
       $("#templateUrl").css("width",$("#screenWidth").val()+"px");
       $("#templateUrl").css("height",$("#screenHeight").val()+"px");
       $("#templateUrl").css("transform-origin","0 0");
       $("#templateUrl").css("-webkit-transform","scale("+$("#screenConfigDiv").width()/$("#screenWidth").val()+")");
       $("#templateUrl").attr("class","");
       if(screens[i].html.indexOf("http")===0)
       {
         $("#templateUrl").attr("src",screens[i].html);
                return true;

       }
       $("#templateUrl").attr("srcdoc",screens[i].html);
       return true;
      }
    }
    return false;
  };
  
  /** Yeni Duvar Ekle butonuna bastığımızda çıkan ilk dialogdaki ekran tiplerinin bulunduğu dropdownlist.
  */
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
  };
  
  /** Yeni Duvar Ekledeki seçilen zamanın kontrollerini yapar.Örnegin yeni duvar için seçilen zaman aralığı çalışma alanının zaman aralığından büyük veya kullanılan bir zaman aralığı olamaz. 
  */
  var getNewWallTimeSelectedTab = function  ()
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
      
      if(checkUsedTimeFlag===false)
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
  };
   
  /** Seçilen zaman aralığının Timelineda kullanılıp kullanılmadığını kontrol eder.
  * @params {string} startTime - Eklenecek duvarın başlangıç zamanı.
  * @params {string} endTime - Eklenecek duvarın bitiş zamanı.
  * @returns {boolean} true|false - Eklenecek duvarın başlangıç zamanı mevcut duvarların kullanımında olup olmadığını kontrol eder.
  */
  var checkUsedTime = function (startTime,endTime)
  {
    for(var i in walls)
    {
      if(walls[i].showTime.indexOf("-")>-1)
      {
        var wallShowTime = walls[i].showTime.split("-");
        var splitShowTime = splitStartAndEndTime(wallShowTime[0],wallShowTime[1]);
        var splitNewWallShowTime = splitStartAndEndTime(startTime,endTime);
    
        if((splitShowTime.startTime<=splitNewWallShowTime.startTime && splitNewWallShowTime.startTime<splitShowTime.endTime)||(splitShowTime.startTime<splitNewWallShowTime.endTime && splitNewWallShowTime.endTime<=splitShowTime.endTime)||(splitShowTime.startTime==splitNewWallShowTime.startTime && splitShowTime.endTime==splitNewWallShowTime.endTime))
        {
          return false;
        }
        
      }
    }
    return true;
  };
  
  /** Gönderilen başlangıç ve bitiş zamanını split eder.
  * @params {string} startTime - Başlangıç zamanı.
  * @params {string} endTime - Bitiş zamanı.
  * @returns object - Başlangıç ve bitiş zamanını saat ve dakikaya split ederek döndürür.
  */
  var splitStartAndEndTime = function (startTime,endTime)
  {
    var splitStartTime = startTime.split(":");
    var splitEndTime = endTime.split(":");
    return{startTime:splitStartTime[0],endTime:splitEndTime[0],startTimeMinute:splitStartTime[1],endTimeMinute:splitEndTime[1]};
  };
  
  /** Yeni Duvar Ekle butonunda çıkan dialogdaki en son next butonu.
  */
  var applyNewWall = function()
  {   
    var screenType = $(".selected").attr('id') ;
    var newWallTime = getNewWallTimeSelectedTab();
 
    if(newWallTime===false)
    {
      Util.handleAjaxError('Başlangıç zamanı bitiş zamanından büyük ve eşit olamaz');
       return;
    }

    if(newWallTime.length===0||newWallTime==="-")
    {
      Util.handleAjaxError("Lütfen Ekranın Zamanını Giriniz");
      return;
    }

    var wallId = "wall"+(walls.length+1);

    if(walls.length>1)
    {
      var wallNumber = walls[walls.length-1].id.replace ( /[^\d.]/g, '' );
      wallId= "wall"+(parseInt(wallNumber)+1);
    }

    var wall = 
    {
      id: wallId,
      type: screenType,
      showTime: newWallTime,
    };
    
    walls.push(wall);
    createDiv(wall);
    drawVisualization();
    currentWallStep=1;
  }; 
   
  /** Yeni Duvar Ekle butonunda çıkan dialogdaki back buttonu.
  */
  var addNewWallModalBackOnClick = function()
  {  
    $(".backWallButton").click(function()
    {	
      currentWallStep=(--currentWallStep<0)?++currentWallStep:currentWallStep;
      showCurrentWallStep(currentWallStep);
    });
  };
  
  /** Yeni Duvar Ekle butonunda çıkan dialogdaki next buttonu..
  */
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
  };
  
  /** Workspace.htmlin açılışta çıkan dialogundaki başlangıç-bitiş zamanını ve çalışma alanı-ekran boyutlarının tam katı olduğunu kontrol eden fonksiyon.
  * @returns {boolean} true - Kullanıcı başlangıç-bitiş zamanını girerek ve çalışma alanı-ekran boyutlarının tam katı olduğu halde çalışma alanı ekleyebilir
  */
  var checkInitialModalValid = function()
  {
    if($("#datetimepicker1").find("input").val().length>0 && 
    $("#datetimepicker2").find("input").val().length>0 &&
    $("#pageWidth").val()%$("#screenWidth").val()===0 &&
    $("#pageHeight").val()%$("#screenHeight").val()===0)
    {
      return true;
    }
  };

  /** Açılışta çıkan dialogdaki en son gösterilen div deki next butonu.
  */
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
      { 
        Util.handleAjaxError("Eksik veya Yanlış Bilgi Giriniz");
      }
    });
  };
  
  /** Açılışta çıkan dialogdaki next butonu.
  */
  var addInitialModalNextOnClick = function()
  {
    $(".nextButton").click(function()
    {	
      currentStep=(++currentStep>numberOfSteps)?--currentStep:currentStep;
      showCurrentStep(currentStep);
    });
  };
  
  /** Açılışta çıkan dialogdaki back butonu.
  */
  var addInitialModalBackOnClick = function()
  {
    $(".backButton").click(function()
    {	
      currentStep=(--currentStep<0)?++currentStep:currentStep;
      showCurrentStep(currentStep);
    });
  };
  
  /** Anasayfa butonu.
  */
  var addManagerPageButtonOnClick = function()
  {
    $("#managerPageButton").click(function()
    {	
      window.location.href = url+"manager.html";
      return;
    });
  };  
  
  /** Keyup Function = Sayfada çıkan ikinci dialog da Workspace ve Ekranların width-height modunu alıp kontrol ediyor.
  */
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
                                  if(sum===0)
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
                                  if(sum===0)
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
  };
  
  /** Dialoglarda girilen oynama süresinin belirlendiği tabları gösterir.
  */
  var addScreenTimerTabs = function()
  {
    $(".nav-tabs a").click(function(){
        $(this).tab('show');
    });
  };
  
  /** Kullanıcının id ile verilen workspace' ini bulur.
  * @params {string} workspaceId - Çalışma alanının id'si.
  * @params {array} workspaces - Çalışma alanı.
  * @returns object workspaces - Kullanıcıya ait çalışma alanını döndürür.
  */
  var findUserWorkspace = function(workspaceId,workspaces)
  {
    for(var i = 0; i<workspaces.length;i++)
    {
      if(workspaceId === workspaces[i].workspaceId)
      {
        return workspaces[i];
      }
    }
    
    return null;
  };
  
  /** Kullanıcının workspace ini değiştirir. Id ile doğru workspace i bulur değiştirir ve workspace' i değişmiş user döndürür.
  * @params object workspace - Çalışma alanı objesi.
  * @params object user - Kullanıcı.
  * @returns object user - Id ile doğru workspace i bulur değiştirir ve workspace' i değişmiş user döndürür.
  */
  var upsertWorkspaceToUser = function(workspace,user)
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
  };
  
  /** Çalışma alanının yatay mı dikey mi olduğunu kontrol eden fonksiyon.
  * @params {string} screenName - Ekran adı.
  * @params object wall - Duvar objesi.
  * @returns {string} - Çalışma alanını, ekranın eni boyundan büyük olursa horizontal küçükse vertical olarak döndürür.
  */
  var checkHorizontalOrVerticalScreen = function(screenName,wall)
  {
    var removeScreenButton = "<button type='button' class='btn btn-danger removeScreen'><span class='glyphicon glyphicon-trash'></span></button>";
    var changeTimeButton = "<button type='button' class='btn btn-default changeTime' data-toggle='modal' data-id='' href='#changeTimeModal'><span class='glyphicon glyphicon-time'></span></button>";
    if($("#pageWidth").val()>$("#pageHeight").val())
    {
      return "<br><div class='newScreen'><h2>"+screenName+"</h2>"+removeScreenButton+changeTimeButton+
      "<ul id='"+wall.id+"' class='list-inline wall' style='width:100%;zoom:10%;'></ul>";      
    }
    
    else
    {
      return "<br><div class='newScreen'><h2>"+screenName+"</h2>"+removeScreenButton+changeTimeButton+
      "<ul id='"+wall.id+"' class='list-group wall' style='zoom:13%;margin-left:43%'></ul>";      
    }
  };
  
  /** Form-control class'ına ait bütün inputları sadece sayı girişini kabul eder.
  */
  var addIsNumberCheck = function ()
  {
    $('.form-control').keypress(function(e) 
    {
      var a = [];
      var k = e.which;

      for (i = 48; i < 58; i++)
        a.push(i);

      if (a.indexOf(k)<0)
        e.preventDefault();

     });
  };

  /** İlk açılışta çıkan dialogdaki anasayfaya dönme butonu.
  */
  var addBackToMainPage = function ()
  {
    $("#backToMainPage").click(function()
    {
      window.location.href = url+"manager.html";
    });
  }
  
  /** Mediaları dialog kısmında yüklendiği yer.
  */
  var addSaveMedia = function ()
  {
    $("#saveMedia").click(function()
    {
       if($("#videoResources").find("option").length>1)
       {
        Util.handleAjaxError("Medya duvarına en fazla bir tane kaynak ekleyebilirsiniz");
        return;
       }
       $("#videoResources").find("option").each(function(e)
        { 
          var mediaUrl = $("#videoResources").find("option")[e].value;
          var thumbnail = $("#videoResources").find("option")[e].className;
          var element="";
          if(mediaUrl.indexOf(".webm")>0||mediaUrl.indexOf(".mp4")>0||mediaUrl.indexOf(".ogg")>0)
          {
            element = "<video autoplay loop src='"+mediaUrl+"' style='width:103%; height:auto;overflow:hidden;'></video>";
          }
          else
          {
            element = "<img src='"+mediaUrl+"' style='width:"+$('#pageWidth').val()+"px; height:"+$('#pageHeight').val()+"px;overflow:hidden;margin:0px;'></img>";
          }
          var mediaWallId = $("#media").val();
          $("#"+mediaWallId).empty(); 
          $("#"+mediaWallId).css('background-image','url("'+thumbnail+'")');
          var mediaHtml = "<html style='margin:0px;overflow:hidden;background-color: #000000;width:100%'><body style='margin:0px;overflow:hidden;width:100%'>"+element+"</body></html>";
          var wallIndex = getWallIndex(mediaWallId);
          var screen = {
            id : mediaWallId,
            thumbnail : thumbnail ,
            html : mediaHtml
          };
          saveScreenToWall(screen,wallIndex);
          $("#videoModal").modal("hide");
          $("#videoResources").empty();
        });
    });
  }
  
  /** Screeni wall'a kaydetme işlemini yapar.
  */
  var saveScreenToWall = function(screen,wallIndex)
  {
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
  }
  
  /** Sayfada bulunan elementlerin onclick, validate gibi olaylarının set edilmesini sağlar.
  */
  var setHtmlElementEvents = function()
  {
    addIsNumberCheck();
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
    addBackToMainPage();
    addMoveRightButtonClick();
    addMoveLeftButtonClick();
    addSaveMedia();
    addOptionOnChange();
  };
  
 	var self=this;
};

$( document ).ready(function() 
{	 
  setLanguage();
  var workspace = new Workspace();
  workspace.initialize();
});

var setLanguage = function()
{
  /** @const */ 
  DEFAULT_VALUE = 'tr';
  /** @const */ 
  PREFERRED_LANGUAGE = navigator.language || 
    navigator.userLanguage || 
    navigator.browserLanguage || 
    navigator.systemLanguage || DEFAULT_VALUE;
  $.ajaxSetup({
    beforeSend: function (xhr)
    {
       xhr.setRequestHeader("Accept-Language", PREFERRED_LANGUAGE);
    }
  });
}