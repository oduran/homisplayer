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
  debugger;
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
  { debugger;
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
  { debugger;
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
  var getWorkspace = function(workspaceId)
  {
    var data = { accessToken:accessToken, workspaceId:workspaceId};
    $.ajax({
      type: "POST",
      url:  serviceUrl+"getworkspace",
      data: data,
      success: function(data){
        workspaceObj = data;
        $( "#pageHeight" ).val(data.height);
        $( "#pageWidth" ).val(data.width);
        $("#datetimepicker1").find("input").val(data.starttime);
        $("#datetimepicker2").find("input").val(data.endtime);
        var workspaceTimer = splitStartAndEndTime(data.starttime,data.endtime)
        self.start = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),workspaceTimer.startTime,workspaceTimer.startTimeMinute,0);
        self.end = new Date(self.date.getFullYear(), self.date.getMonth(),self.date.getDate(),workspaceTimer.endTime,workspaceTimer.endTimeMinute,0);

        for(var i = 0 ; i<data.walls.length ;i++)
        {
          var wall = {
          id: data.walls[i].id,
          type: data.walls[i].type,
          showTime: data.walls[i].showTime,
          }
          
          walls.push(wall);
          createDiv(wall);
          drawVisualization();
        }
      },
      error: function(error){debugger;}
    });
    
  }
  function getNewWallUpdateTimeSelectedTab ()
  {
    debugger;
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
    {debugger;
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

    /*Ekran seçiminde çıkacak draggable objectlerin set edildiği yer */
		$(".draggable").draggable();
    var draggableArguments={
			 revert: 'true',
			 helper:'clone',
			 appendTo: '#drophere',
			 refreshPositions: true,
			 containment: 'DOM',
			 zIndex: 1500,
			 addClasses: false
		};

		$('.group').draggable(draggableArguments);
		$('.group').droppable();

		$(".nav-sidebar").droppable({
			tolerance: "intersect",
			accept: ".group",
			activeClass: "ui-state-default",
			hoverClass: "ui-state-hover",
			drop: function(event, ui) {
				$(".nav-sidebar").append($(ui.draggable));
			}
		});
		$('#drophere').droppable({
			accept: ".group",
			activeClass: "ui-state-highlight",
			drop: function( event, ui ) 
      {
        // clone item to retain in original "list"
        var $item = ui.draggable.clone();
        $(this).addClass('has-drop').html($item);
        $("#drophere .group").css("width","100%");
        $("#drophere .group").css("height","100%");
        $("#drophere .screeniframe").css("width","100%");
        $("#drophere .screeniframe").css("height","75vh");
        $("#drophere .screeniframe").css("transform","scale(1)");
        $("#drophere .screeniframe").css("transform-origin","transform-origin: 0px 0px 0px");
			}
		});	
    var getWorkspaceId=Util.getParameterByName('workspaceId');
    if(getWorkspaceId!==null)
    {
      getWorkspace(getWorkspaceId);
      return;
    }
    
    $('#initialModal').modal(
    {
      backdrop: 'static',
      keyboard: false 
    });
    $('#initialModal').modal('show');
		showCurrentStep(currentStep);
     
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
      var playerScreenDiv = "<div id='"+wall.id+"_screen"+i+"' class='wall_screen' style='width:"+$("#screenWidth").val()+"px;height:"+$("#screenHeight").val()+"px;'></div>";
      
      document.getElementById(wall.id).innerHTML+=playerScreenDiv ;
    }
    document.getElementById(wall.id).innerHTML+="<br><br>";
  }
  
  var createMediaScreen = function(wall)
  {
    var screenName = wall.id.replace("wall","Ekran");
    var workspaceDiv = "<br><div class='newScreen'><h2>"+screenName+"</h2><button type='button' class='btn btn-danger removeScreen'><span class='glyphicon glyphicon-trash'></span></button><button type='button' class='btn btn-default changeTime' data-toggle='modal' data-id='' href='#changeTimeModal'><span class='glyphicon glyphicon-time'></span></button><div id='"+wall.id+"' class='wall' style='width:100%;height:"+$("#pageHeight").val()+"px;zoom:13%;'></div>";
    document.getElementById('workspaceForm').innerHTML+=workspaceDiv;
    var playerScreenDiv = "<div id='"+wall.id+"_screen' class='wall_screen' style='width:"+$("#pageWidth").val()+"px;height:"+$("#pageHeight").val()+"px;'></div>";
    document.getElementById(wall.id).innerHTML+=playerScreenDiv ;
    document.getElementById(wall.id).innerHTML+="<br><br>";
  }
  
  var addSaveWorkspaceOnClick = function()
  {
    $(".saveButton").click(function()
    {
      $("#workspaceNameDialog").modal("show");
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
      
      workspaceObj=Util.mergeObjects(workspaceObj,newWorkspaceObj);
      console.log(JSON.stringify(workspaceObj));
      
      var data = { accessToken:accessToken, workspace: workspaceObj};
      $.ajax({
        type: "POST",
        url: serviceUrl+"saveworkspace",
        data: data,
        success: function(data){
         BootstrapDialog.alert("Çalışma Alanı Başarıyla Kaydedildi.");
        },
        error: function(error){}
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
    $('#workspaceForm').on('click', '[class^=wall_screen]', function(){
       $('#fsModal').modal('show');
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
  function checkUsedTime(startTime,endTime)
  {
    debugger;
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
  function splitStartAndEndTime(startTime,endTime)
  {
    var splitStartTime = startTime.split(":");
    var splitEndTime = endTime.split(":");
    return{startTime:splitStartTime[0],endTime:splitEndTime[0],startTimeMinute:splitStartTime[1],endTimeMinute:splitEndTime[1]}
  }
  // Yeni Duvar Ekle butonunda çıkan dialogdaki en son next butonu.
  var applyNewWall = function()
  {   debugger;
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
  }
  
 	var self=this;
};

$( document ).ready(function() 
{	 
  var wallManager = new WallManager();
  wallManager.initialize();
});