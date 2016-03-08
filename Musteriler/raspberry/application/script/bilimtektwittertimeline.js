	var tweetarr =[];
	
	function getQueryParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
	function mapDOM(element, json) {
		var treeObject = {};
		// If string convert to document Node
		if (typeof element === "string") {
			if (window.DOMParser) {
				parser = new DOMParser();
				docNode = parser.parseFromString(element,"text/xml");
			} else { // Microsoft strikes again
				docNode = new ActiveXObject("Microsoft.XMLDOM");
				docNode.async = false;
				docNode.loadXML(element);
			}
			element = docNode.firstChild;
		}

		//Recursively loop through DOM elements and assign properties to object
		function treeHTML(element, object) {
			object["type"] = element.nodeName;
			var nodeList = element.childNodes;
			if (nodeList != null) {
				if (nodeList.length) {
					object["content"] = [];
					for (var i = 0; i < nodeList.length; i++) {
						if (nodeList[i].nodeType == 3) {
							object["content"].push(nodeList[i].nodeValue);
						} else {
							object["content"].push({});
							treeHTML(nodeList[i], object["content"][object["content"].length -1]);
						}
					}
				}
			}
			if (element.attributes != null) {
				if (element.attributes.length) {
					object["attributes"] = {};
					for (var i = 0; i < element.attributes.length; i++) {
						object["attributes"][element.attributes[i].nodeName] = element.attributes[i].nodeValue;
					}
				}
			}
		}
		treeHTML(element, treeObject);

		return (json) ? JSON.stringify(treeObject) : treeObject;
	}

  
	jQuery(document).ready(function ($) {
		var twitterId = getQueryParameterByName("twitterId");
		var config8 = {
			"id": twitterId,//'666636527968088064', -> kafesfirin
			"dataOnly": true,
			"customCallback": populateTpl,
			"lang":'tr',
			"dateFunction": momentDateFormatter,
			"enableLinks":false,
			"showImages":false,
			"maxTweets":20
		};

		function momentDateFormatter(date, dateString) {
			return moment(dateString).fromNow();
		}
		twitterFetcher.fetch(config8);

		function populateTpl(tweets) {
			for (var i = 0, lgth = tweets.length; i < lgth; i++) {
			try{
				var tweetObject = tweets[i];
				var author = JSON.parse( mapDOM(tweetObject.author,true));
				var userAvatar = author.content[2].content[1].content[1].attributes;
				var tw = tweetObject.tweet;
				var ind = tw.search('pic.twitter.com');
        var userString = author.content[2].attributes["aria-label"];
        var userNameRegex = /.*\(ekran adı: (.*)\)/
        var realNameRegex = /(.*) \(ekran adı:.*/
        var userName = userNameRegex.exec(userString)[1];
        var realName = realNameRegex.exec(userString)[1];
				//var username  = author.content[2].content[3].content[1].content[0];
				tw = tw.replace(/\b(a href="https:\/\/t\.co.*" rel="nofollow" dir="ltr" data-expanded-url="https:\/\/www.swarmapp.*" .*a)\b/g,"br/");
				tweetarr.push({
					Contents : (ind===-1? tw : tw.replace(tw.substring(ind,ind+26),'') ), //  tweetObject.tweet'teki pic.twitter.com linklerinden arindirma,
					RealName : realName,
					UserImageUrl:(userName==="kafesfirin"?'../media/kafeslogo.png': userAvatar["data-src-2x"].replace("_bigger",'')),
					Username: userName,
					DisplayTime: (tweetObject.time.indexOf('sa')>0?tweetObject.time+". önce":tweetObject.time)

				});
				}
				catch(e)
				{
					continue;
				}
			}
		}
	});

	$(function () {
		if (tweetarr == []){ // calismadi
			$('#errordiv').removeClass().addClass('unhidden');
		}else {


			var newTweets = tweetarr;

			$('ul li:first-child').addClass('animateIn current');

			setInterval(function () {
				$current = $('.current');

				if (newTweets.length > 0) {
					fillTweets();
				}

				$next = $current.next('li').length > 0 ? $current.next('li') : $('ul li:first-child');


				$('.animateOut').removeClass('animateOut');
				$current.removeClass('animateIn current').addClass('animateOut');
				$next.delay(500).addClass('animateIn current');


				if (newTweets.length > 0) {
					setTimeout(function () {
						$current.remove();
						newTweets = [];
					}, 2000);
				}

			}, 15000);

			function fillTweets() {
				$('ul li:not(".current")').remove();

				$.each(newTweets, function (key, value) {
         
					$('ul').append(
							'<li>' +
							'<div class="tweet clearfix">' +
							' <div class="topwrap clearfix">' +
							'<div class="imgWrap">' +
							'<img  src="' + value.UserImageUrl + '"/>' +
							' </div>' +
							'<div class="userInfoWrap">' +
							'<h2>' + value.RealName + '</h2>' +
							' <h3>' + value.DisplayTime + '</h3>' +
							' <h4>@' + value.Username + '</h4>' +
							'</div>' +
							' </div>' +
							' <p>' + value.Contents + '</p>' +
							' </div>' +
							' </li>');
				});
        $( "p img" ).each(function( index ) 
      {
        if($(this).hasClass("Emoji"))
        {
          $(this).css("width","6vh");			
        }
      });
			}
      
    }
	})