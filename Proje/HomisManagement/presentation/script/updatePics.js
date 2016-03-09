
// set default options
var socialMediaOptions = {
    twitter: {
        accounts: ['@kafesfirin'],
        limit: 30,
        consumer_key: 'OYzdB2ZdbHdOUBmAri1a63Lm7', // make sure to have your app read-only
        consumer_secret: 'hEFC71bwNj2PCxxS3ldK86aE4PegHRAI3p1Bjx5doXBmAb76Se', // make sure to have your app read-only
    },
    instagram:{
        accounts: ['@kafesfirin'],
        limit: 20,
        client_id: '88b4730e0e2c4b2f8a09a6184af2e218'
    }
}

var sliderOptions = {
    // GENERAL SETTINGS
    length: 100, // content.css'de container class'inda override ediliyor
    show_media: true,
    // Moderation function - if returns false, template will have class hidden
    moderation: function(content) {
        return (content.text) ? content.text.indexOf('fuck') == -1 : true;
    },
    //update_period: 5000,
    // When all the posts are collected and displayed - this function is evoked
    callback: function() {
		
		setTimeout(function(){
			var pictureSliderScroller = new PictureSliderScroller('.socialmediapicturecontainer', 30000,'.attachment');
			pictureSliderScroller.run();},30000);
    }
}

var updatePics = function(twitterId,socialMedia) 
{
    if(twitterId!==""){
        var initialQuery =  twitterId;
        var queryTags = initialQuery.split(",");
        socialMediaOptions[socialMedia]['accounts'] = queryTags;
        sliderOptions[socialMedia]=socialMediaOptions[socialMedia];
    }
    sliderOptions[socialMedia]=socialMediaOptions[socialMedia];
    $('.socialmediapicturecontainer').bilimteksocialmediapictureslider(sliderOptions);
};


