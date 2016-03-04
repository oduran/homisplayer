	var mockSunrise = new Date();
	mockSunrise.setHours(7);
	var mockSunset = new Date();
	mockSunset.setHours(18);
    var weatherWidgetObj = {
        sunrise: (mockSunrise.getTime()/1000),
        sunset : (mockSunset.getTime()/1000)
    }
	
	var getQueryParameterByName = function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
var loadBilimtekWeather = function(divId, forecastHour)
{
  var apiKeys = ['8e82ec315100332c9f3aa2c76045a','a272014963b21c3dc5cb5998048ba','d41ce4dfe469c427dcbf48713ea77'];
  $('#'+divId).bilimtekWeather({
    forecastHour: forecastHour,
    WWOAPIKey: '6a3905b54ba672fdbfdce034dafc2ac9',
    premiumAPIKey: true,
    WWOAPIVersion:1, // free api key'de 2 olacak
    imgPath: '../media/weatherimages/',
    timeFormat: 24,
    refreshInterval: 600000,
    alwaysShowForecast:false,
    enableSearchField:false,
    enableForecast:false,
    reduction:'auto', //0-1 arasi veya auto
    showHum:false,
    showPrec:false,
    showVis:false,
    showPress:false,
    showHigh:false,
    showLow:false,
    showWind:false,
    lang : 'tr',
    units : 'metric',
    divId : divId,
    CSSanimations		: false,
    JSanimations		: false,
    snow				: false,
    rain				: false,
    wind				: false
  });
}
	
	var checkContainer = function(divId) {
		var xdivId = '#'+divId;
		if($(xdivId).is(':visible')){ 
			if(divId=='weather'){
				getWeather2();

				setInterval(function(){getWeather2()},600000);
			}
			else if(divId=='kayanyazi'){
				$('.marquee').marquee();
			}
		} else {
			setTimeout(function() { checkContainer(divId) }, 100); //wait 100 ms, then try again
		}
	}
  
  var startWeatherTimer = function(divId, forecastHour) {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    var xtime=h + ":" + m;
    if(forecastHour != 0)
    {
      today.setHours(today.getHours()+forecastHour);
      var xhour = today.getHours();
      xtime = (xhour<10?'0'+xhour:xhour)+ ":00" ;
    }
    $('#'+divId+' .ws-time').html(xtime);
    var t = setTimeout(function()
    {
      startWeatherTimer(divId,forecastHour);
    }, 500);
  }

  var checkTime = function(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
  }
	jQuery(document).ready(function ($) {
 		$(".ws-iinner").empty();
    var url= $("#bilimtektwittertimeline").attr('src');
		var twitterId = getQueryParameterByName("twitterId",url);
    twitterId = (twitterId==="")?"666636527968088064":twitterId ; // default kafes firin
		var twitterName = getQueryParameterByName("twitterName",url);
		twitterName = (twitterName == "")? "@kafesfirin" : "@"+twitterName;
    $("#bilimtektwittertimeline").load(function(){
      $("#bilimtektwittertimeline").contents().find(".twitterelement p").text(""+twitterName);
    });
    var swarmVenueId = getQueryParameterByName("swarmVenueId",url);
		swarmVenueId = (swarmVenueId == "")? "@kafesfirin" : swarmVenueId;
    var swarmOauthToken = getQueryParameterByName("swarmOauthToken",url);
		swarmOauthToken = (swarmOauthToken == "")? "@kafesfirin" : swarmOauthToken;
    
		var sliderMedia = getQueryParameterByName("sliderMedia",url);
		sliderMedia = (sliderMedia==='')? "twitter" : sliderMedia; // default twitter
		loadBilimtekWeather('bilimtekweather1',0);
		startWeatherTimer('bilimtekweather1',0);
		updatePics(twitterName,sliderMedia);
		document.getElementById("bilimtektwittertimeline").src = "/themes/bilimtektwittertimeline.html?twitterId="+twitterId+"&twitterName="+twitterName;
		var qrCodeUrl = 'url("https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=www.'+sliderMedia+'.com/'+twitterName+'")';
		$("#qrcode").css('background-image', qrCodeUrl);
		var token=swarmOauthToken;
		var venueId=swarmVenueId;
		var fs = new BilimtekSwarm(token, venueId);
		fs.run();
	});