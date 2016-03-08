var BilimtekSwarm=function(token,venueId){
	this.people=[];
	this.count=-1;
	
	var getUrl=function(){
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
				var newItems = data.response.hereNow.items;
				if ($("div").hasClass("marqueeZeroCount")) 
				{
					$("#foursquare").empty();
				}

				for(var i = 0; i< self.people.length; i++)
				{
					if(!self.getPersonFromArray(self.people[i], newItems))
					{
						self.people = self.removeFromArray(self.people[i], self.people);
					}
				}
				
				for(var i =0;i<newItems.length;i++)
				{
					if(!self.getPersonFromArray(newItems[i], self.people))
					{
						self.people.push(self.createPerson(newItems[i]));
					}
				}

				if(data.response.hereNow.items.length === 0)
				{	
						$("#foursquare").empty();
						self.people = [];
						$("<div class='marqueeZeroCount'>Buraya Check-In yapın!</div>").prependTo("#foursquare");
				}					
		});    
			
		request.fail(function () {

			var logger = new Logger();
			logger.log("Swarm Request Exceeded","ekrand.html");
		});
	}
	
	this.getPersonFromArray = function(item,itemArray)
	{
		for(var i = 0;i<itemArray.length;i++)
		{
			if(itemArray[i].id === item.id)
			{
				return itemArray[i];
			}
		}
		
		return null;
	}
	
	this.removeFromArray = function(item,itemArray)
	{
		var resultArray = [];
		for(var i = 0; i < itemArray.length;i++)
		{
			if(item.id !== itemArray[i].id)
			{
				resultArray.push(itemArray[i]);
			}
		}
		
		return resultArray;
	}
	
	this.createPerson = function(item)
	{
		var photoSuffix = item.user.photo.suffix,
		photoPrefix = item.user.photo.prefix,
		photoUrl= photoPrefix + "original" + photoSuffix,
		firstName = item.user.firstName;
		lastName = (typeof item.user.lastName === "undefined")? "" : item.user.lastName;
		var person = {
			uiElement: '<img class="marqueeleftThenRight" src="' + photoUrl + '"  width="55" height="55" /><p class="marqueebottomThenTop">Hoşgeldiniz </p><p class="marqueebottomThenTop">' + firstName+' '+lastName+ ' </p>', 
			id: item.id,
			shown: false};
		return person;
	}
	
	this.iteratePeople = function(){
		var userSlideInterval = setInterval(function(){
			self.people = self.resetIfAllShown(self.people);
			for(var i=0;i<self.people.length;i++)
			{
				if(!self.people[i].shown)
				{
					$("#foursquare").empty();
					$(self.people[i].uiElement).appendTo("#foursquare");
					self.people[i].shown = true;
					return;						
				}
			}
		},10000);
	}
	
	this.resetIfAllShown = function(people)
	{
		for(var i = 0; i< people.length; i++)
		{
			if(!people[i].shown)
			{
				return people;
			}
		}
		
		for(var i = 0; i< people.length; i++)
		{
			people[i].shown = false;
		}
		
		return people;
	}
	
	this.getFoursquareData = function()
	{
		var checkinRequestInterval=setInterval(function(){self.request();},12000);
	}
	
	this.run = function(){
		this.getFoursquareData();
		this.iteratePeople();
	}
	
	var self = this;
}