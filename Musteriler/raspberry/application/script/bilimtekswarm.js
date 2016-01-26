var BilimtekSwarm=function(token,venueId){

	this.checkinId = [];
	this.userNames = [];
	this.userPhotos = [];
	this.currentMayor=[];
	this.count=0;
	var getUrl=function(){
		console.log("getUrl");
		return "https://api.foursquare.com/v2/venues/"+venueId+"/herenow?v=20131016&oauth_token="+token+"&"+getRandomNumber();
	}
	var getRandomNumber=function(){
		var date = new Date();
		return date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds();
	}

	this.request=function(){
		var request = $.ajax({
			url: getUrl(),
			context: document.body
		});
		request.success(function (data) {
				$.each(data.response.hereNow.items, function (i, item) {
					
					if(self.checkinId.length>data.response.hereNow.items.length){
						while(self.checkinId.length > 0) {
							self.checkinId.pop();
						}
						while(self.currentMayor.length > 0) {
							self.currentMayor.pop();
						}
					}
					
					if(self.checkinId.length<data.response.hereNow.items.length){
					 i=self.checkinId.length;
					}
					
				if(self.checkinId[i]!=data.response.hereNow.items[i].id)
				{	 
					if ($("div").hasClass("marqueeZeroCount")) 
					{
						$("#foursquare").empty();
					}
					var photoSuffix = data.response.hereNow.items[i].user.photo.suffix,
					photoPrefix = data.response.hereNow.items[i].user.photo.prefix,
					photoUrl= photoPrefix+"original"+photoSuffix,
					firstName = data.response.hereNow.items[i].user.firstName,
					lastName = data.response.hereNow.items[i].user.lastName;
						if (typeof lastName === "undefined") {
							lastName="";
						}					
					self.checkinId.push(data.response.hereNow.items[i].id);
					self.currentMayor.push('<img class="marqueeleftThenRight" src="' + photoUrl + '"  width="55" height="55" /><p class="marqueebottomThenTop">Hoşgeldiniz </p><p class="marqueebottomThenTop">' + firstName+' '+lastName+ ' </p>')
					}
				});
				
				if(data.response.hereNow.count==0)
				{
						$("#foursquare").empty();
						$("<div class='marqueeZeroCount'>Buraya Check-In yap!</div>").prependTo("#foursquare");
				}					

		});    
			
		request.fail(function () {
			$("#foursquare").empty();
			var logger = new Logger();
			logger.log("Swarm Request Exceeded","ekrand.html");
		});
	}
	
	this.iteratePeople = function(){
		var userSlideInterval = setInterval(function(){
			if(self.currentMayor.length>0){
				$("#foursquare").empty();
				$(self.currentMayor[self.count]).appendTo("#foursquare"); 
				self.count++;
				if(self.count==self.currentMayor.length){
				self.count=0;
				}
			}
		},10000);
	}
	
	this.getFoursquareData = function()
	{
		var checkinRequestInterval=setInterval(function(){self.request();},9000);
	}
	
	this.run = function(){
		this.getFoursquareData();
		this.iteratePeople();
	}
	var self = this;
}