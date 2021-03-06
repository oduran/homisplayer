	var mockSunrise = new Date();
	mockSunrise.setHours(7);
	var mockSunset = new Date();
	mockSunset.setHours(18);
    var weatherWidgetObj = {
        sunrise: (mockSunrise.getTime()/1000),
        sunset : (mockSunset.getTime()/1000)
    }
	
	function getQueryParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
	function loadBilimtekWeather(divId, forecastHour)
	{
				var apiKeys = ['8e82ec315100332c9f3aa2c76045a','a272014963b21c3dc5cb5998048ba','d41ce4dfe469c427dcbf48713ea77'];
	            $('#'+divId).bilimtekWeather({
				forecastHour: forecastHour,
                WWOAPIKey: '6a3905b54ba672fdbfdce034dafc2ac9',
                premiumAPIKey: true,
                WWOAPIVersion:1, // free api key'de 2 olacak
                imgPath: '../script/bilimtekweather/bilimtekweather/img/',
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
				divId : divId
            });
	}
	
	function checkContainer (divId) {
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

	jQuery(document).ready(function ($) {
		var twitterId = getQueryParameterByName("twitterId");
		twitterId = (twitterId===''?'666636527968088064':twitterId); // default kafes firin
		var twitterName = getQueryParameterByName("twitterName");
		var sliderMedia = getQueryParameterByName("sliderMedia");
		sliderMedia = (sliderMedia===''?'twitter':sliderMedia); // default twitter
		function startTime(divId, forecastHour) {
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
				startTime(divId,forecastHour);
			}, 500);
		}

		function checkTime(i) {
			if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
			return i;
		}
		
		loadBilimtekWeather('bilimtekweather1',0);
		startTime('bilimtekweather1',0);
		
		setTimeout(function(){
			loadBilimtekWeather('bilimtekweather2',3);
			startTime('bilimtekweather2',3);
		},2000);
		
		setTimeout(function(){
			loadBilimtekWeather('bilimtekweather3',6);
			startTime('bilimtekweather3',6);
		},4000);
		
		updatePics(twitterName,sliderMedia);
		document.getElementById("bilimtektwittertimeline").src = "../script/bilimtektwittertimeline/index.html?twitterId="+twitterId;
	});