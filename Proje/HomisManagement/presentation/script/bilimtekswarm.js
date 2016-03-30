var BilimtekSwarm=function(token,venueId){
	this.people=[];
	this.count=-1;
	
  /** Foursquareden bilgileri almak için çekilen url.
  *{return} {string} fileContent - playerId.
  */
	var getUrl = function()
  {
    var url = "https://api.foursquare.com/v2/venues/"+venueId+"/herenow?v=20131016&oauth_token="+token+"&"+getRandomNumber();
		return url;
	}
	
  /** Url cacheden çalışmaması için random bir sayı üreten fonksiyon.
  *{return} {string} datenow - random bir sayı.
  */
	var getRandomNumber = function()
  {
		var date = new Date();
    var dateNow = date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds();
		return dateNow;
	}

  /** Url den gelen JSON datasından içerik elementlerinin oluşturulduğu fonksiyon.
  */
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
	
  /** Url den gelen JSON datasından kişileri çeken fonksiyon.
  *{return} {array} itemArray - Kişi listesi.
  */
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
	
  /** Kişi listesinden checkin yapan kişinin olmaması durumunda listeden o kişiyi çıkaran fonksiyon.
  *{param} {object} item - Kişi.
  *{param} {array} itemArray - Kişi listesi.
  *{return} {array} resultArray - Düzenlenmiş kişi listesi.
  */
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
	
  /** Kişinin bilgileri kullanılarak element oluşturan fonksiyon.
  *{param} {object} item - Kişinin bilgilerini tutan obje.
  *{return} {object} person - Düzenlenmiş kişi objesi.
  */
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
	
  /** 10 saniyede bir kişilerin dizilimini kontrol eden fonksiyon. Yeni kişi gelirse dizilimi resetleyip baştan oluşturur.
  */
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
	
  /**Yeni kişi geldiğinde eğer ekranda gösterilmediyse o kişiyi ekler.
  *{param} {object} person - Kişi objesi.
  */
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
	
  /**9 saniyede bir request yollar.
  */
	this.getFoursquareData = function()
	{
		var checkinRequestInterval=setInterval(function(){self.request();},9000);
	}
	
  /** Foursquare başlatılma fonksiyonu.
  */
	this.run = function(){
		this.getFoursquareData();
		this.iteratePeople();
	}
	
	var self = this;
}