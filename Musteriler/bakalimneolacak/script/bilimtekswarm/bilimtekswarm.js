var BilimtekSwarm=function(token,venueId){
	this.checkinId = [];
	this.userNames = [];
	this.userPhotos = [];
	this.currentMayor=[];
	this.count=0;
	this.jsonURL = "https://api.foursquare.com/v2/venues/"+venueId+"/herenow?v=20131016&oauth_token="+token;

	this.request=function(){
		var request = $.ajax({
			url: self.jsonURL,
			context: document.body
		});
		request.success(function () {
			$.getJSON(self.jsonURL, function (data) {
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
					var photoSuffix = data.response.hereNow.items[i].user.photo.suffix,
					photoPrefix = data.response.hereNow.items[i].user.photo.prefix,
					photoUrl= photoPrefix+"original"+photoSuffix,
					firstName = data.response.hereNow.items[i].user.firstName,
					lastName = data.response.hereNow.items[i].user.lastName;
						if (typeof lastName === "undefined") {
							lastName="";
						}					
					self.checkinId.push(data.response.hereNow.items[i].id);
					self.currentMayor.push('<img class="marqueeleftThenRight" src="' + photoUrl + '"  width="55" height="55" /><p class="marqueebottomThenTop">Hoşgeldiniz </p><br><p class="marqueebottomThenTop">' + firstName+' '+lastName+ ' </p>')
					}
				});
			});
		});    
			
		request.fail(function () {
			$("#foursquare").empty();
		$("<div class='marqueebottomThenTop'>Request Exceeded</div>").prependTo("#foursquare");
		});
	}
	
	this.iteratePeople = function(){
		var userSlideInterval = setInterval(function(){
			if(self.currentMayor.length>0){
			$(self.currentMayor[self.count]).appendTo("#foursquare"); 
				setTimeout(function(){$("#foursquare").empty()},4900);
				self.count++;
				if(self.count==self.currentMayor.length){
				self.count=0;
				}
			}
		},5000);
	}
	
	this.getFoursquareData = function()
	{
		var checkinRequestInterval=setInterval(function(){self.request();},20000);
	}
	
	this.run = function(){
		this.getFoursquareData();
		this.iteratePeople();
	}
	var self = this;
}