/*
Home-Finder
Copyright (C) 2013-2018

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var userIsLoggedIn = false;
var allGroupsAlreadyLoaded = false;
var FBuser = null;
var loginStatus = null;

function redirectAfterLogin()
{
	var loc = window.location.href,
	index = loc.indexOf('#');

	if (index > 0) {
		window.location = loc.substring(0, index);
	}
	else
	{
		window.location = window.location;
	}
}

function FB_Login()
{
	FB.login(function(response) {
		//redirectAfterLogin();
		//used to have read_stream,user_groups,user_likes,user_photos too...
	}, {scope: ''});
}

function FB_logout()
{
	FB.logout(function(response) {
		// user is now logged out
		location.reload(); 
	});
}
  
window.fbAsyncInit = function() {

	FB.init({
	  appId      : fb_appId, // App ID
	  channelUrl : fb_channelUrl, // Channel File
	  status     : true, // check login status
	  cookie     : true, // enable cookies to allow the server to access the session
	  xfbml      : true // parse XFBML
	});

	// Listen to the auth.login which will be called when the user logs in
	// using the Login button
	FB.Event.subscribe('auth.login', function(response) {
		// We want to reload the page now so PHP can read the cookie that the
		// Javascript SDK sat. But we don't want to use
		// window.location.reload() because if this is in a canvas there was a
		// post made to this page and a reload will trigger a message to the
		// user asking if they want to send data again.
		//window.location = window.location;
		redirectAfterLogin();
	});

	FB.Canvas.setAutoGrow();

	FB.getLoginStatus(function(response) {
		loginStatus = response;
	  
		if (response.status == "connected") {
			// logged in and connected user

			userIsLoggedIn = true;

			if (loginStatus && loginStatus.authResponse && loginStatus.authResponse.accessToken)
			{
				accessToken = loginStatus.authResponse.accessToken;
			}

			FB.api('/me', {fields: 'first_name'}, function(response) {
				FBuser = response;
				$("#login_wrapper").prepend('<span class="menu_message">שלום, ' 
									+ response.first_name 
									+ '!</span>'
									+ ' <span class="menu_message" style="font-size: 0.8em">'
									+ '[<a href="javascript:void(0)" onclick="javascript:FB_logout()" style="padding:0">יציאה</a>]'
									+ '</span>');
			});

			$("#showAllGroups").fancybox({
				maxWidth	: 800,
				beforeLoad : function(){
					if (allGroupsAlreadyLoaded == false)
					{
						getAllGroups();
					}
				},
				helpers:  {
				    overlay: {
					locked: false
				    }
				}

			});

			//$("#showAllGroupsWrapper").html('לרשימת כל הקבוצות <a href="#allGroups" id="showAllGroups">לחצו כאן</a>.');
			$("#showAllGroupsWrapper").html('לצפייה ברשימת הקבוצות הסגורות <a href="#allGroups" id="showAllGroups">לחצו כאן</a>.');

		} else {
			// used to have read_stream,user_groups,user_photos,user_likes too...
			$("#login_wrapper").prepend('<span class="fb-login-button" style="margin-top: 7px; width: 69px;" data-scope="" width="70"></span>');

			//$("#showAllGroupsWrapper").html('לצפייה ברשימת הקבוצות המלאה עליכם <a href="#" onclick="FB_Login(); return false;">להתחבר</a> עם חשבון הפייסבוק.');
			$("#showAllGroupsWrapper").html('לצפייה ברשימת הקבוצות הסגורות עליכם <a href="#" onclick="FB_Login(); return false;">להתחבר</a> עם חשבון הפייסבוק.');
			FB.XFBML.parse();

		}
		 
		start();
	});
};

// Load the SDK Asynchronously
(function(d, s, id) {
var js, fjs = d.getElementsByTagName(s)[0];
if (d.getElementById(id)) return;
js = d.createElement(s); js.id = id;
js.src = "//connect.facebook.net/he_IL/all.js";
fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// --------------------------------------------------------------------------

var cookie_transportation_dest = readCookie("transportation_dest_" + cookieSuffix);
if (cookie_transportation_dest)
{
	workDest = decodeURIComponent(cookie_transportation_dest);
}

var groupMetadata = {};

var groupPosts = new Array();

var groupPostsByFid = {};

var duplicateBucketCounter = 0;

var maxOldPostsToShow = 5;

var maxPostsPerLoad = 100;
var maxPostsPerLoad_mobile = 30;

var g_numOldPosts = 0;

var waypointsDisabled = false;

var currentTimestamp = new Date().getTime();

var isLocalStorageSupported = is_html5_storage_supported();

var post_invalidity_time = 1209600000; //1209600000 milli = 2 weeks

var current_date = new Date();

var windowWidth = $(window).width();

var minWindowWidthForNavButtons = 1040;

// ----

var cookieLastTimeStamp = readCookie("lastTimeStamp_" + cookieSuffix);

var chosenLastTimeStamp = (userLastTimeStamp != null ) ? userLastTimeStamp : cookieLastTimeStamp;

if (chosenLastTimeStamp != null)
{
	var lastVisit = hebDate(new Date(parseInt(chosenLastTimeStamp)));
	if (lastVisit != "")
	{
		$("#app_details").append('ביקורך האחרון: ' + lastVisit);
	}
}

// ----

var groupFilterCookieName="groupFilter_" + cookieSuffix;

var cookieGroupFilter = readCookie(groupFilterCookieName);
var userGroupFilter = null;

var chosenGroupFilter = (userGroupFilter != null ) ? userGroupFilter : cookieGroupFilter;

if (chosenGroupFilter == null)
{
	chosenGroupFilter = 0xffffffff;
}

var isMobile = $(".show-for-small").first().is(":visible");

var loaderWatchDog = null;/*setTimeout(function(){
							location.reload(); 
						}, 7000);*/

// ----

var td = new Date();
var nextSunday = new Date(td.getFullYear(),td.getMonth(),td.getDate()+(7-td.getDay()));
var nextSunday_date = nextSunday.getDate();
var nextSunday_month = nextSunday.getMonth() + 1;
var nextSunday_year = nextSunday.getFullYear().toString().slice(-2); //last two digits
var nextSunday_str = nextSunday_month + "/" + nextSunday_date + "/" + nextSunday_year;


$(document).ready(function() {
	
	showSection();
	
	$(".various").fancybox({
		maxWidth	: 800,
		maxHeight	: 600,
		fitToView	: false,
		width		: '75%',
		height		: '75%',
		autoSize	: false,
		closeClick	: false,
		openEffect	: 'none',
		closeEffect	: 'none',
		type       : "iframe",
		iframe     : {
		   preload : false // this will prevent to place map off center
		},
		helpers:  {
		    overlay: {
				locked: false
		    }
		},
        afterLoad: function(current, previous) {
            //Fixes some weird overlay problem in chrome
        	$(window).scrollTop($(window).scrollTop()+1);
        }
	});
	
	if (!isMobile)
	{
		$(".bus").fancybox({
			fitToView	: false,
			width		: '95%',
			height		: '95%',
			autoSize	: false,
			closeClick	: false,
			openEffect	: 'none',
			closeEffect	: 'none',
			type       : "iframe",
			iframe     : {
				   preload : false // this will prevent to place map off center
				},
			beforeLoad : function(){
				this.href = this.href + "&daddr="+workDest;
			},
			helpers:  {
			    overlay: {
					locked: false
			    }
			},
	        afterLoad: function(current, previous) {
	            //Fixes some weird overlay problem in chrome
	        	$(window).scrollTop($(window).scrollTop()+1);
	        }
		});
	} 

	
	$(".fancybox").fancybox({
	    'mouseWheel'    :    true,
	    'openEffect'    :   'elastic',
	    'closeEffect'   :   'elastic',
	    'nextEffect'    :   'fade',
	    'prevEffect'    :   'fade',
	    'loop'          :   false,
	    keys  : {
		    prev : {
			13 : 'right', // enter
			33 : 'up',   // page up
			39 : 'right', // right arrow
			38 : 'up'    // up arrow
		    },
		    next : {
			8  : 'left', // backspace
			34 : 'down',  // page down
			37 : 'left', // left arrow
			40 : 'down'   // down arrow
		    }
	    },
	    direction : 
				{ 
					next : 'right', 
					prev : 'left' 
				},
	    helpers:  {
		    overlay: {
				locked: false
		    }
		},
        afterLoad: function(current, previous) {
            //Fixes some weird overlay problem in chrome
        	$(window).scrollTop($(window).scrollTop()+1);
        }
	  });
	  
	//$("#aboutLink, a.login_now_link").fancybox({
	$("a.login_now_link").fancybox({
		maxWidth	: 800,
		helpers:  {
		    overlay: {
				locked: false
		    }
		},
        afterLoad: function(current, previous) {
            //Fixes some weird overlay problem in chrome
        	$(window).scrollTop($(window).scrollTop()+1);
        }
	});
	
	$(".transportLink").fancybox({
		maxWidth	: 800,
		beforeLoad : function(){
			$("#transportation_message").html("&nbsp;");
			$("#transportation_dest").val(decodeURIComponent(workDest));
		},
		helpers:  {
		    overlay: {
				locked: false
		    }
		},
        afterLoad: function(current, previous) {
            //Fixes some weird overlay problem in chrome
        	$(window).scrollTop($(window).scrollTop()+1);
        }
		
	});
	
	$("#add_apartment_link").fancybox({
		maxWidth	: 400,
		helpers:  {
		    overlay: {
				locked: false
		    }
		},
        afterLoad: function(current, previous) {
            //Fixes some weird overlay problem in chrome
        	$(window).scrollTop($(window).scrollTop()+1);
        }
		
	});
	
	
        $(document).foundation(
        	'topbar', 
        	{
        		sticky_class : 'sticky',
        		scrolltop : false,
				custom_back_text: true,
				back_text: 'חזרה'
			}
	); 
		
	$("#transportation_dest").keydown(function(){$("#transportation_message").html("&nbsp;");});
	
	$("#change_transportation").click(change_transportation);
	
	$("a[href='#top']").click(function() {
		$("html, body").animate({ scrollTop: 0 }, "fast");
		return false;
	});
	
	if (!isMobile)
	{
		$(document).on('mouseenter','.viewProfile', function (event, element) {
			var profileId = $(this).attr('data-from-id');
			//For some reason, this sometimes gave incorrect values: $(this).data("from-id");
			var imgSrc = 'https://graph.facebook.com/v2.3/' + profileId + '/picture?type=large';
			$(this).append('<div id="profilePicDiv" class="profilePicClass"></div>');
			var theImage = new Image();
			theImage.src = imgSrc;

			$(theImage).load(function() {
				var imageWidth = theImage.width;
				$("#profilePicDiv").width(imageWidth).html('<a href="https://www.facebook.com/app_scoped_user_id/' 
				+ profileId + '" target="_BLANK"><img src="' + theImage.src + '"/></a>');
			});
		}).on('mouseleave','.viewProfile',  function(){
			$("div.profilePicClass").remove(); //Removing by ID caused problems
		});

		var resizeTopBar = function()
		{
			if ($("#topBarWrapper").height() > $("#topBar").height() + 10)
			{
				$("#app_details").hide();
			}
			else
			{
				$("#app_details").show();
			}
		};
		resizeTopBar();
		$( window ).resize(function() {
			resizeTopBar();
			windowWidth = $(window).width();
			if (windowWidth < minWindowWidthForNavButtons)
			{
				$("#posts div.navButtons").css('visibility', 'hidden');
			}
			else
			{
				$("#posts div.navButtons").css('visibility', 'visible');
			}
		});
		
		$("body").addClass("nonmobile");
	}
	else
	{
		$("#search").height($("#searchBox").outerHeight());
		$("#app_details").css("font-size", "0.7em").parent().css("padding", "0 15px");

		$("#menu_links a.menuLink").click(function(){
			tempDisableWaypoints();
			//Close the menu
			closeMenu();
			setTimeout(function(){
				$(window).scrollTop($(window).scrollTop() - $("#topBar").height());
			}, 100);
		});

		$(".sectionLink").click(function(){
			closeMenu();
		});
		
		maxPostsPerLoad = maxPostsPerLoad_mobile;
		
		$("body").addClass("mobile");
	}

	if ( ($('html').hasClass('lt-ie9')) || (!$.support.leadingWhitespace) ) 
	{
	    // this will execute if browser is IE 8 or less
		$("#topBar").after('<div class="oldBrowser">' 
				+ 'אזהרה: הינך צופה באתר בדפדפן מיושן. האתר נצפה בצורה מיטבית בדפדפן מודרני.</div>');
	}

	$("#hideDupd_cb").change(function() {
		var hideDups = $(this).is(':checked');
		dupDisplayOptions(!hideDups);
		calculateShownPosts();
	}); 

	$("#showFavorites_cb").change(function() {
		var showFavorites = $(this).is(':checked');
		favoritesDisplayOptions(showFavorites);
		calculateShownPosts();
	}); 

	var hideDups = readCookie("hideDups");
	if (hideDups !== null)
	{
		dupDisplayOptions((hideDups == 1) ? false : true);
	}

	//$("#search").click(performSearch);
	$("#searchBox").change(function(){
		performSearch();
	});

	$(window).bind( 'hashchange', function(e) {
		var sectionToShow = showSection();
		if (sectionToShow != null)
		{
			setTimeout(function(){
				$(window).scrollTop(0);
			}, 100);
			calculateShownPosts();
		}
	});

	if (isLocalStorageSupported)
	{
		$("#icon_legend").prepend('<li><img src="/images/block_user.png" alt="חסימת משתמש"/> -' +  
										' חסימת משתמש' + 
									'</li>');
		$("#icon_legend").prepend('<li><img src="/images/star_empty.png" alt="שמירת ההודעה במועדפים"/> -' +  
										' סימון ההודעה כהודעה מועדפת' + 
									'</li>');
	}
	else
	{
		$("#sub_blocked").hide();
		$("#sub_favorites").hide();
	}

	/*$("#contentSeparator").before("<p><span style='color: red'>עדכון חשוב:</span> עקב שינויים במנגנון ההרשאות של פייסבוק, לא ניתן " + "" +
			"להציג הודעות מקבוצות סגורות, גם אם אתם חברים בהן. הקפידו לבדוק את הקבוצות הסגורות עצמאית! לנוחיותכם, קיימת רשימה של קבוצות סגורות "
			+" תחת תפריט הקבוצות.</p>");*/
	
});

function closeMenu()
{
	//$('.top-bar, [data-topbar]').css('height', '').removeClass('expanded');
	$('.top-bar').css('height', '').removeClass('expanded');
};

function showFeedbackForm()
{
	var feedbackElement = $("#feedback");
	if (feedbackElement.has("iframe").length == 0)
	{
		feedbackElement.append('<iframe width="600" height="740" frameborder="0" marginwidth="0" ' 
							+ 'marginheight="0" ' 
							+ ' src="https://docs.google.com/forms/d/1SBj7Lb4Y8JtkDx0ef-uWYBvNAfTC784QFXzvz-DYLQk/viewform?embedded=true">' 
							+ 'טוען...</iframe>');
	}
};

function unblockUsers()
{
	if (!isLocalStorageSupported)
	{
		return;
	}
	
	var counter = 0;
	
	$("#blockedUsersSelect > option:selected").each(function() {
		var uid = this.value;
		delete blockedUsers[uid];
		$("#posts div.fromUser_" + uid).removeClass("filteredUser").css("opacity", "1");
		counter++;
		$(this).remove();
	});
	
	if (counter > 0)
	{
		localStorage["blockedUsers"] = JSON.stringify(blockedUsers);
	
		calculateShownPosts();
	}
};

function populateBlockedUsers()
{
	if (!isLocalStorageSupported)
	{
		return;
	}
	
	loadBlockedUsers();
	
	var blockedSelect = $("#blockedUsersSelect");
	blockedSelect.html("");
	
	$.each(blockedUsers, function(uid) {
		if (blockedUsers[uid].name)
		{
			blockedSelect.append("<option value='" + uid + "'>" + blockedUsers[uid].name + "</option>");
		}
	});
	
};

function showSection()
{
	var mainSections = {
		"posts": 	{"searchEnabled": true, 	"getContentFunc": null}, 
		"about": 	{"searchEnabled": false,	"getContentFunc": null},
		"privacy": 	{"searchEnabled": false,	"getContentFunc": null},
		"feedback":	{"searchEnabled": false, 	"getContentFunc": showFeedbackForm},
		"mngBlocked":	{"searchEnabled": false, 	"getContentFunc": populateBlockedUsers}
	};
	
	var sectionToShow = "posts";
	if(window.location.hash) {
		sectionToShow = window.location.hash.replace("#!", "");
	}
	var elementToShow = $("#" + sectionToShow + "Wrapper");
	var sectionData = mainSections[sectionToShow];
	
	if ( (elementToShow.length > 0) && (typeof(sectionData) != "undefined") )
	{
		if (sectionData.getContentFunc != null)
		{
			sectionData.getContentFunc();
		}
		
		$(".mainSection").hide();
		elementToShow.show();

		$(".sectionLink").removeClass("active");
		$("#" + sectionToShow + "Link").addClass("active");

		$("#searchBox").prop('disabled', !sectionData.searchEnabled);

		return sectionToShow;
	}
	
	return null;
};

var filterFunc = null;

function performSearch()
{
	$("#loadingPosts").slideDown();
	$("#posts").hide();
	setTimeout(function(){
		$("#loadingPosts").slideUp();
		$("#posts").show();
	}, 500);

	var oldSearchExisted = (filterFunc != null);
	currentPostScroll = -1;
	
	var searchTerm = $("#searchBox").val();
	if (searchTerm == search_placeholder)
	{
		//IE8 bug?
		searchTerm = "";
	}
	
	if (searchTerm == "")
	{
		filterFunc = null;
		
		$("#posts div.post").each(function(){
			if (!$(this).hasClass("filteredOut"))
			{
				$(this).removeHighlight();
			}
			else
			{
				$(this).removeClass("filteredOut");
			}
		});
	}
	else
	{
		var searchTermArr = searchTerm.split(/[\s,]+/);
		if (searchTerm.indexOf('"') !== -1)
		{
			//If a given phrase was within parentheses, search for the exact match
			var searchTermArrTemp = [];
			var inParentheses = false;
			var parenthesesTerm = "";
			for (var i = 0; i < searchTermArr.length; ++i)
			{
				if (searchTermArr[i][0] == '"')
				{
					inParentheses = true;
					parenthesesTerm = searchTermArr[i].substring(1);
				}
				else if (inParentheses)
				{
					if (searchTermArr[i][searchTermArr[i].length - 1] == '"')
					{
						inParentheses = false;
						parenthesesTerm += " " + searchTermArr[i].slice(0, -1);
						searchTermArrTemp.push(parenthesesTerm);
						parenthesesTerm = "";
					}
					else
					{
						parenthesesTerm += " " + searchTermArr[i];
					}
				}
				else
				{
					searchTermArrTemp.push(searchTermArr[i]);
				}
			}

			if (inParentheses)
			{
				// Parentheses started, did not end - just treat the whole remaining phrase as in Parentheses.
				searchTermArrTemp.push(parenthesesTerm);
			}
			searchTermArr =  searchTermArrTemp;
		}
		//console.log(searchTermArr);
		
		filterFunc = function(postId, postElement)
		{
			var matchesTerm = function(postId, word) 
			{
				var thePost = groupPosts[postId];
				if ( (thePost.message) && (thePost.message.indexOf(word) !== -1) )
				{
					return true;
				}
	
				if ( (thePost.description) && (thePost.description.indexOf(word) !== -1) )
				{
					return true;
				}
	
				if ( (thePost.name) && (thePost.name.indexOf(word) !== -1) )
				{
					return true;
				}
	
				if ( (thePost.comments) && (thePost.comments.data) )
				{
					var termFound = false;
					
					$.each(thePost.comments.data, function(commentKey, commentVal) 
					{
						if ( (commentVal.message) && (commentVal.message.indexOf(word) !== -1) )
						{
							termFound = true;
							return false; // == break;
						}
					});
					
					if (termFound)
					{
						return true;
					}
				}
	
				return false;
			};

			var allWordsFound = true;
			for (var stInx in searchTermArr)
			{
				if (matchesTerm(postId, searchTermArr[stInx]) == false)
				{
					allWordsFound = false;
					break;
				}
			}
			
			if (oldSearchExisted && (!$(postElement).hasClass("filteredOut")))
			{
				$(postElement).removeHighlight();
			}
			
			if (allWordsFound)
			{
				$(postElement).removeClass("filteredOut");
				for (var stInx in searchTermArr)
				{
					$(postElement).highlight(searchTermArr[stInx]);
				}
			}
			else 
			{
				$(postElement).addClass("filteredOut");
			}
		};

		$("#posts div.post").each(function(){
			var postId = $(this).attr("id").replace("post", "");
			filterFunc(postId, this);
		});
	}
	
	$('html, body').animate({
	    scrollTop: $("#num_posts").offset().top - $("#topBar").height() - 10
	}, 1000);

	setTimeout(function(){calculateShownPosts();}, 500);
};

var blockedUsers = {};

function blockUserDialog(postId)
{
	if (!isLocalStorageSupported)
	{
		return;
	}
	
	var fb_user = groupPosts[postId].from;
	$.fancybox({
	    //'width'              : '70%',
	    'autoScale'          : true,
	    'scrolling'   : 'no',
	    content: '<h2>חסימת משתמשים</h2>' 
	    		+ '<p>האם אתם בטוחים שברצונכם לחסום את ' + fb_user.name + '?</p>' 
	    		+ '<p>חסימת המשתמש/ת תסתיר את כל ההודעות שלו/שלה כרגע ובעתיד.'
	    		+ '<br/>חסימת משתמשים הינה מקומית לדפדפן ולמחשב הנוכחיים.'
	    		+ '<br/>ניתן לבטל חסימה של משתמש/ת באמצעות כניסה ל<a href="#!mngBlocked" onclick="$.fancybox.close()">תפריט ניהול החסומים</a>.</p>'
	    		+ '<div style="text-align: left;">'
	    		+ '<a href="#" onclick="$.fancybox.close(); blockUser(' + postId + '); return false;" class="button alert small">חסימה</a>'
	    		+ '<a href="#" onclick="$.fancybox.close();return false;" class="button secondary small" style="margin-right: 10px;">ביטול</a>'
	    		+ '</div>'
	});
}

function blockUser(postId)
{
	if (!isLocalStorageSupported)
	{
		return;
	}
	
	var fb_user = groupPosts[postId].from;
	if (typeof(blockedUsers[fb_user.id]) == "undefined")
	{
		//block the user
		blockedUsers[fb_user.id] = {name: fb_user.name};
	}

	localStorage["blockedUsers"] = JSON.stringify(blockedUsers);
	var groupElements = $("#posts div.fromUser_" + fb_user.id);
	$.when(groupElements.animate({opacity: '0'}, "slow", "swing", function(){
		$(this).addClass("filteredUser");
	})).then(function () {
		calculateShownPosts();
	});
}

var savedPosts = {};

function changePostSavedState(postId)
{
	if (!isLocalStorageSupported)
	{
		return;
	}
	
	var fb_post_id = groupPosts[postId].id;
	if (typeof(savedPosts[fb_post_id]) == "undefined")
	{
		//save the post
		var val = (isNaN(groupPosts[postId].created_time_parsed)) 
					? null : groupPosts[postId].created_time_parsed ;
		savedPosts[fb_post_id] = {created_time_parsed: val};
		$("#post" + postId).removeClass("unsavedPost").addClass("savedPost");
	}
	else
	{
		//unsave the post
		delete savedPosts[fb_post_id];
		$("#post" + postId).removeClass("savedPost").addClass("unsavedPost");
	}

	localStorage["savedPosts"] = JSON.stringify(savedPosts);
	
	if ($("#showFavorites_cb").is(':checked'))
	{
		calculateShownPosts();
	}
};


var word_boundry = "(?=[\\+\\b\\.!?,\\*\\s\\-\\)\\(/\\-:'}\\\"\\\\]|$)"; //end

if (streetArr != null)
{
	var streetList = buildListRegexFromArray(streetArr);
	var streetNameRegex = new RegExp("((?:(?:[\\s\\(\\)\\-:/{\\\",\\.]+|^)ב?מ?ל?ו?)("+streetList+")(\\s*(?:[1-9][0-9]*)?))" + word_boundry,"g");
}

if (neighborhoodArr != null)
{
	var neighborhoodList = buildListRegexFromArray(neighborhoodArr);
	var neighborhoodRegex = new RegExp("(^|[^א-ת](?:ש?ב?ה?מ?ל?ו?)?)" + "(" + neighborhoodList + ")" + word_boundry,"ig");
}



var phraseRegex = new RegExp(/(הרכבת הקלה|מתחם הרכבת|בתקופה זו|תקופה של|תחנת הרכבת|טיילת הרכבת|כל התקופה|בן אדם|לא עובד|שימו לב|לאדם|לתקופה|לרכבת|רמי לוי|מוצפת|ברמה|מפרץ חיפה|ברות|משותפת|מראה את|להמליץ|עובד ב|[^ה]מדרגות)/g);

//Phrases that contain one of the words that are also part of a street name and also a special word below
var phraseRegex2 = new RegExp("(כ\"ט בנובמבר)", "g");

var subletRegex = new RegExp(/(מסאבלטת|מסאבלט|מסבלטת|מסבלט|סבלט|סאבלט|סאלבט)/g);

var roommateRegex = new RegExp(/(שותפ\/ה|שותף\/ה|שותף|שותפה|שותפים|שותפות|שותפ)/g);

var coupleRegex = new RegExp("([^א-ת]|ל|ו|ול|^)(זוגות|זוג)" + word_boundry, "g");

var monthRegex = new RegExp("([\\s\\-]+" 
/*alingToLeft*/			+ "(?:ב|מ|ל|ו)?" 
/*alignToLeft*/ 		+ "(?:ינואר|פברואר|מרץ|מרס|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר|מיידי|מיידית|מידית|הכניסה|כניסה)" 
				+ word_boundry + ")", "g");

var rentRegex = new RegExp(/((?:[1-9][\d,]*[\d])?[ ]*(שכר דירה|שכר הדירה|ש"ח|שקל|ש״ח|שח|ש''ח|ש'ח|שכה"ד|שכ"ד|שכ״ד|שכה״ד|שכד|כולל ה-כ-ל|שקלים|לחודש|כולל הכל|הסכום הוא|מחיר)(?:[^א-ת]|$)\s*(?:[1-9][\d,]*[\d])?)/g);
var rentRegex2 = new RegExp(/((?:[1-9][\d,]*[\d])?[ ]*(₪)\s*(?:[1-9][\d,]*[\d])?)/g);

var streetRegex = new RegExp(/(מדרחוב|רחוב(?!ות)|רח')/g);

//"((?:(?:[\\s\\(\\)\\-:/]+|^)ב?ה?מ?ל?ו?)"
var stuffRegex = new RegExp("(^|[^א-ת](?:ב?ה?מ?ל?ו?)?)" + 
		"(מיקרוגל|מזרן|מיטה|מכונת כביסה|פינת אוכל|בסיס|קומקום|מגירות|מגירה|מדף|מראה|שידה|שואב אבק|DVD|דיוידי|כורסא|כורסה|כורסאות|מדפים|שידות|מזרון|ספה|ספות|כסאות|כיסאות|כסא|כיסא|מקרר|תנור|כיריים|טוסטר אובן|מייבש|מדיח|מזגן|מאוורר|מסך|טלויזיה|טלוויזיה|שולחנות|שולחן|כורסאות|ארונות|ארון בגדים|ארון|מיטות|ספריה|אופניים|מדפסת|שולחן אוכל|שולחן כתיבה|שידת|מיקרו|מיטת יחיד|מיטה זוגית|ארגז מצעים|שטיח|שטיחים|כורסת|ארונית|רדיאטור|ספרייה|הליכון|טלויזיות|שששששש)"+word_boundry, "g");

var religionRegex = new RegExp("(^|[^א-ת](?:ל|ה|ול|ו)?)(דתיה|דתייה|דתי|כשרות|דתית|כשר|שבת|דתיים|דתיות)" + word_boundry, "g");
//var religionRegex = new RegExp("([^א-ת]|ל|ה|ול|ו|^)(דתיה|דתייה|דתי|כשרות|כשר|שבת|דתיים|דתיות)" + word_boundry, "g");
//var religionRegex = new RegExp(/(דתיה|דתייה|דתי|כשרות|דתית|כשר|שבת|דתיים|דתיות)(?=[\b\.!?,\s\)\(\\/]|$)/g);

var currentPostScroll = -1;
var groupPostsLength = 0;
var lastPostIdToShow = 0;

function scrollToPost(direction)
{
	var lastShownPostId = parseInt($("#posts div.post:visible:last").attr('id').replace("post",""));
	var newPostScroll = currentPostScroll + direction;
	var i = 0;

	
	if ( newPostScroll < 0 )
	{
		return;
	}
	
	if (newPostScroll > lastShownPostId)
	{
		var oldPostButton = $("#showOldPostsA");
		if (oldPostButton.hasClass("additional_new_posts"))
		{
			oldPostButton.click();
			setTimeout(function(){scrollToPost(direction);}, 200);
		}
		return;
	}
	
	do
	{
		++i;
		if ($("#post"+newPostScroll).is(":visible"))
		{
			currentPostScroll = newPostScroll;
			break;
		}
		newPostScroll += direction;
	} while (newPostScroll >=0 && newPostScroll < groupPostsLength && i < 300);
	
	if (i >= 300)
	{
		logResponse("Infinite loop in scrollToPost()");
		return;
	}
	
	if ( (newPostScroll < 0) || (newPostScroll >= groupPostsLength) )
	{
		return;
	}

	$('html, body').animate({
		scrollTop: $("#post"+currentPostScroll).offset().top - $("#topBar").height() - 10 
	}, 500);
};

function scrollFromPostToPost(fromPost, direction)
{
	currentPostScroll=fromPost;
	scrollToPost(direction);
};

function tempDisableWaypoints()
{
	waypointsDisabled = true;
	setTimeout(function()
	{
		waypointsDisabled = false;
	}, 1000);
};

function showDupMatch(postId1, postId2)
{
	var wordRegex = new RegExp(/(?:^|[^a-zA-Z0-9א-ת])([a-zA-Z0-9א-ת])+(?=[^a-zA-Z0-9א-ת]|$)/g);
	var words1 = groupPosts[postId1].message.match(wordRegex);
	var m1 = getMultisetFromArr(words1);
	var words2 = groupPosts[postId2].message.match(wordRegex);
	var m2 = getMultisetFromArr(words2);
	if (console && console.log)
	{
		console.log(words1);
		console.log(m1);
		console.log(words2);
		console.log(m2);
	}
	return multisetDiff(m1, m2);
}

function findDuplicate(postId)
{
	var counter = 0;
	//var wordRegex = new RegExp(/(?:^|[\b^0-9א-ת])([a-zA-Z0-9א-ת])+(?=[^a-zA-Z0-9א-ת]|$)/g);
	var wordRegex = new RegExp(/(?:^|[^a-zA-Z0-9א-ת])([a-zA-Z0-9א-ת])+(?=[^a-zA-Z0-9א-ת]|$)/g);
	var words1 = [];
	var m1 = {};
	
	for (var i = postId-1; i >= 0 && counter < 100; --i)
	{
		if (groupPosts[postId].from.id == groupPosts[i].from.id)
		{
			if (groupPosts[postId].message == null || groupPosts[i].message == null)
			{
				return (groupPosts[postId].message == groupPosts[i].message) ? i : -1;
			}

			if (groupPosts[postId].message.length == groupPosts[i].message.length)
			{
				if (groupPosts[postId].message == groupPosts[i].message)
				{
					return i;
				}
			}

			if (words1.length == 0)
			{
				//Calculate words1 only once
				words1 = groupPosts[postId].message.match(wordRegex);
				if (words1 == null)
				{
					return -1;
				}
				
				m1 = getMultisetFromArr(words1);
			}
			
			var words2 = groupPosts[i].message.match(wordRegex);
			var m2 = getMultisetFromArr(words2);
			
			if (multisetDiff(m1, m2) >= 0.75)
			{
				return i;
			}
		}
		++counter;
	}
	return -1;
};

function dupDisplayOptions(show)
{
	if (show)
	{
		$("#dupStyle").remove();
	}
	else
	{
		$('body').prepend('<style id="dupStyle">.dup, .dupPost {display:none;}</style>');
	}
	
	$('#hideDupd_cb').prop('checked', !show);
	setCookie("hideDups", ((show) ? -1 : 1), 365); //one year
}

function favoritesDisplayOptions(showOnlyFavorites)
{
	if (showOnlyFavorites)
	{
		$('body').prepend('<style id="favoritesStyle">.unsavedPost {display:none;}</style>');
	}
	else
	{
		$("#favoritesStyle").remove();
		$('#showFavorites_cb').prop('checked', false);
	}
}

function showDup(postId)
{
	//$("#post"+postId).removeClass("dup");
	$("#post"+postId + " .dupMessage").remove();
	$("#post"+postId + " .mainPostContent").slideDown(500, function(){
		$("#post"+postId)
		.removeClass("dup")
		.removeClass("postBackOdd")
		.removeClass("postBackEven")
		.addClass("dupPost");
	});
};

function change_transportation() 
{
	
	try 
	{
		var dest = $("#transportation_dest").val();
		if ( (!dest) || (dest.trim() == "") )
		{
			var e = {};
			e.error_message = "יעד ריק איננו חוקי!";
			throw e;
		}
		
		if (dest.length > 100)
		{
			var e = {};
			e.error_message = "היעד שהוכנס ארוך מדי!";
			throw e;
		}
		
		dest = dest.trim();
		
		workDest = encodeURIComponent(dest);
		
		setCookie("transportation_dest_" + cookieSuffix, workDest, 365); //one year
		
		$("#transportation_message").css("color", "green");
		$("#transportation_message").text("היעד שונה בהצלחה!");
		$("#transportation_dest").blur();
	} 
	catch (e)
	{
		if (e.error_message)
		{
			$("#transportation_message").text("שגיאה: " + e.error_message);
			$("#transportation_message").css("color", "red");
		}
	}
	return false;
};

function escapeHtml(val)
{
	return $('<div/>').text(val).html();
};

function getShowDupMessage(postKey)
{
	var res = "";
	res +=	'<div class="messageFromSite dupMessage"><p>';
	res +=	'הודעה זו סומנה בתור הודעה כפולה מכיוון שהמשתמש פרסם הודעה דומה בקבוצה אחרת לאחרונה. ';
	res +=	'לצפייה בהודעה המלאה ובתגובות שלה, <a href="javascript:void(0)" onclick="showDup(' + postKey + ');">לחצו כאן</a>. ';
	res +=	'להסתרת הודעות כפולות לחלוטין, <a href="javascript:void(0)" onclick="dupDisplayOptions(false);calculateShownPosts();">לחצו כאן</a>.';
	res +=	'</p></div>';
	return res;	
}

function replaceKeywords(text) 
{
	//Important: Nothing here can have an ID since it might be cloned as part
	// of a comment 
	
	text = text.replace(/(״)/g, "\"");
	
	text = text.replace(/(׳)/g, "'");

	//Phrases to skip - will be stripped later on
	//Must be first
	text = text.replace(phraseRegex,"<span class='skip'>$1</span>");
	
	//must be second
	text = text.replace(phraseRegex2,"<span class='skipBeforeStreets'>$1</span>");

	text = text.replace(subletRegex,"<b style='color: Tomato'>$1</b>"); 

	text = text.replace(roommateRegex,"<b style='color: red'>$1</b>");
	
	text = text.replace(coupleRegex,"$1<b style='color: Magenta'>$2</b>"); 
	
	text = text.replace(monthRegex," <b style='color: blue'>$1</b> "); 
	
	text = text.replace(rentRegex2,"<b style='color: green'>$1</b> "); //must come before rentRegex 
	text = text.replace(rentRegex,"<b style='color: green'>$1</b> "); 

	if (neighborhoodArr != null)
	{
		text = text.replace(neighborhoodRegex,"$1<b style='color: purple'>$2</b>");
	}
	
	text = text.replace(streetRegex,"<b style='color: BurlyWood'>$1</b>");
	
	text = text.replace(stuffRegex,"$1<b style='color: DodgerBlue'>$2</b>");
	
	text = text.replace(religionRegex,"$1<b style='color: Olive'>$2</b>");
	
	//must come before streets
	text =  text.replace(/<span class='skipBeforeStreets'>.*?<\/span>/g, function(match, p1)
		{
			return removeTags(match);
		});
	
	//must be before last
	if (streetArr != null)
	{
		text = text.replace(streetNameRegex, function(match, p1, p2, p3)
			{
				
				var pre_linebreak = "";
				var post_linebreak = "";
				
				if (/\d+/.test(p3))
				{
					//if p3 is numeric
					var p3Num = parseInt(p3);
					if (p3Num > 1000)
					{
						//probably not a street address
						return match;
					}
				}
				
				/*
				console.log("start")
				console.log("p1", p1)
				console.log("p2", p2)
				console.log("p3", p3)
				console.log("end")
				*/
				
				var a = p1;
				if (a.indexOf("\n") == 0)
				{
					pre_linebreak = "\n";
				}
				if (new RegExp(/\n\s*$/).test(a)) {
				    	post_linebreak = "\n";
				}
				
				a = a.replace(/\n/g, "");
				
				var firstLetter = a.search(/[א-ת]/);
				pre_linebreak += a.substring(0, firstLetter);
				a = a.substring(firstLetter, a.length);
				
				var b = ""+p2+p3;
				b = b.replace(/('|׳)/g, '&apos;').replace(/\n/g, "");
				
				var link_class = "locationLink";
				var bus_class  = "locationLink";
				var onclick_action = "";
				var link_target = "";
				var bus_link_href_suffix = "";
				var maps_link = "https://www.google.com/local";
	
				if (!isMobile)
				{
					link_class += " various fancybox.iframe";
					bus_class  += " bus fancybox.iframe";
					onclick_action = " onclick='return false'";
				}
				else
				{
					link_target = " target='_BLANK' ";
					bus_link_href_suffix = "&daddr="+workDest;
					maps_link = "https://maps.google.com/";
				}
				
				//If URLs stop working, try https://maps.google.com/ or https://www.google.com/maps?
				
				return ""+pre_linebreak+"<b style='color: orange'><a class='" 
					+ link_class + "' href='" + maps_link + "?output=embed&f=q&source=s_q&language=iw&hl=iw&ie=UTF8&geocode=&q=רחוב+" 
					+ b + ",+" + cityName + "+" + cityName_en + "' " + onclick_action + link_target + ">" 
					+ a + "</a></b> [ <a class='" + bus_class + "' href='https://www.google.com/local?saddr=" 
					+ b + ",+"+cityName+"&ie=UTF8&f=d&sort=def&dirflg=r&hl=he&nwhen=dep&date=" 
					+ nextSunday_str + "&time=8:00am&output=embed" + bus_link_href_suffix 
					+ "' " + onclick_action + link_target 
					+ "><img src='/images/bus.jpg' width='15' alt='bus'/></a> ] " + post_linebreak;
			});
	}

	//Strip the phrases we don't want to color
	//Must be last
	text =  text.replace(/<span class='skip'>.*?<\/span>/g, function(match, p1)
		{
			return removeTags(match);
		});

	
	return text;
};

			
function getPhotos(albumId, postId, postKey)
{

	$("#photos_" + postId).html("<img src='/images/ajax-loader.gif' />");
	var res = "";
	var fbApiVars = {fields: 'attachments'};
	if (!userIsLoggedIn)
	{
		fbApiVars.access_token = accessToken;
	}

	FB.api("/v2.5/" + postId, fbApiVars, function(json) 
	{
		//console.log(albumId, postId, postKey, json)
		if (json && json.error)
		{
			var errorMessage = "getPhotos() error: "
			if (json.error.message)
			{
				errorMessage += json.error.message;
			}
			
			if (json.error.code)
			{
				errorMessage += " Error Code: " + json.error.code;
			}
			
			logResponse(errorMessage);
			return;
		}
		
		var theImages = [];
		if (json && json.attachments && json.attachments.data && json.attachments.data[0])
		{
			var theData = json.attachments.data[0];
			//console.log(theData);

			if (theData.media && theData.media.image)
			{
				theImages.push(theData.media.image);
			}

			if (theData.subattachments && theData.subattachments.data)
			{
				for (var i = 0; i < theData.subattachments.data.length; i++)
				{
					var theSubattachment = theData.subattachments.data[i];
					
					if (theSubattachment.media && theSubattachment.media.image)
					{
						theImages.push(theSubattachment.media.image);
					}
				}
			}
			
			theImages.sort(function(a, b){
				var heights = [0, 0];
				var objects = [a, b];
				//console.log(objects)

				for (var i = 0; i < heights.length; i++)
				{
					if (typeof(objects[i].height) != "undefined")
					{
						heights[i] = objects[i].height;
					}
				}

				return (heights[0] > heights[1]) ? -1 : 1; 
			});

			if ( (theImages.length == 1) 
					&& (typeof(groupPosts[postKey].picture) != "undefined") 
					&& ( (typeof(groupPosts[postKey].name) != "undefined") || (typeof(groupPosts[postKey].description) != "undefined") )
				)
			{
				var pic = groupPosts[postKey].picture;
				if (theImages[0].src == pic)
				{
					//image will be seen as part of inner attachment
					$("#photos_" + postId).remove();
					return;
				}

				// try to see if the address is not equal but represents the same picture
				var lastSlash = pic.lastIndexOf("/");
				if (lastSlash > 0)
				{
					var dotAfterLastSlash = pic.indexOf(".",lastSlash);
					if (dotAfterLastSlash > 0)
					{
						var imageName = pic.substring(lastSlash + 1, dotAfterLastSlash);
						if ( (imageName) && (theImages[0].src.indexOf(imageName)) > 0)
						{
							//image will be seen as part of inner attachment
							$("#photos_" + postId).remove();
							return;
						}
					}
				}
			}
			//console.log(theImages);

			var counter = 1;
			var numOfPics = theImages.length;
			$.each(theImages, function (key, val){
				//console.log(val);
				var imgSrc = val.src;
				/*
				if (imgSrc.indexOf("?") == -1)
				{
					imgSrc = imgSrc.replace("_s", "_n");
					imgSrc = imgSrc.replace(/\/\w\d+x\d+/, "");
				}
				*/
				
				res += '<a class="fancybox th radius" style="margin: 0 5px;" rel="photo_group_' 
					+ postId + '" href="' + imgSrc + '" title="תמונה ' + counter++ + ' מתוך ' + numOfPics + '">';
				res += 		'<img src="' + val.src + '" alt=""  width="150" />';
				res += '</a>';
			});
			
			$("#photos_" + postId).html(res);
		};

	});
};

function printPost(postValue, postKey)
{

	if (typeof (postValue.mainGroup) == "undefined")
	{
		//groupPostsLength--;
		return;
	}
	
	var dupId = findDuplicate(postKey);
	var isDup = (dupId != -1);

	if (!isDup)
	{
		//First post of its kind
		postValue.duplicateBucket = duplicateBucketCounter;
		++duplicateBucketCounter;
	}
	else
	{
		//Copy from duplicate post
		postValue.duplicateBucket = groupPosts[dupId].duplicateBucket;
		
		groupMetadata[postValue.mainGroup.id].num_dups++;
	}
	
	
	var comments = "";

	if (postValue.comments)
	{
		//IMPORTANT: Nothing here can have an ID since it's being cloned!!!
		
		var numOfParsedComments = 0;
		
		comments = "<ul class='post_comments' style='margin-right: 2.5em;' data-original-post-key='" + postKey + "'>";
		$.each(postValue.comments.data, function (key, val){
			var comment = "";

			if (val.message)
			{
				if (val.message_tags)
				{
					var numOfTags = val.message_tags.length;
					for (var tagCounter = 0; tagCounter < numOfTags; ++tagCounter)
					{
						if (val.message_tags[tagCounter].name && val.message_tags[tagCounter].name == val.message)
						{
							//Message is just a name tag, ignore it
							return true; //== continue
						}
					}
				}

				if (val.message.length <= 3)
				{
					var lowerCaseMessage = val.message.toLowerCase();
					if (lowerCaseMessage == "." 
						|| lowerCaseMessage == ".."
						|| lowerCaseMessage == "..."
						|| lowerCaseMessage == "up")
					{
						return true; //==continue
					}
				}
				
			}
			
			if (val.message)
			{
				comment = nl2br(replaceKeywords(replaceURLWithHTMLLinks(escapeHtml(val.message))));
			}

			if (val.attachment && val.attachment.media && val.attachment.media.image && val.attachment.media.image.src)
			{
				var imgSrc = val.attachment.media.image.src;

				comment += '<br/><a class="fancybox th radius" style="margin: 0 5px;" href="' 
					+ imgSrc.replace("_s", "_n") + '">';
				comment += 	'<img src="' + imgSrc + '" alt=""  width="150" />';
				comment += '</a>';
			}
			
			if (comment == "")
			{
				if (userIsLoggedIn)
				{
					comment = "<span class='messageFromSite'>לא ניתן להציג תגובה זו</span>";
				}
				else
				{
					comment = "<span class='messageFromSite'>" + 
						"לא ניתן להציג תגובה זו כאשר אינכם מחוברים לאתר. " +
						"<a class='login_now_link' href='#login_now' onclick='return false;'>לחצו כאן</a> על מנת להתחבר לאתר." + 
						"</span>";
				}
			}
			comments += "<li><b>" 
							+ val.from.name + '</b> '
							+ ((val.from.id == postValue.from.id) ? ' <span class="ownerComment">[בעל/ת ההודעה המקורית]</span>' : '')  
							+ ":<br/> " + comment + " </li>";

			++numOfParsedComments;
		});
		
		if (postValue.comments.paging && postValue.comments.paging.next)
		{
			comments += "<li><b class='messageFromSite'>קיימות תגובות נוספות שאינן מוצגות. להצגה יש לפתוח את <a href='http://www.facebook.com/" 
				+ postValue.id + "' target='_BLANK'>ההודעה המלאה</a>.</b><br/></li>";
		}
		
		comments += "</ul>";

		if (numOfParsedComments == 0)
		{
			//All the comments might have been name tags, which are removed
			comments = "";
		}
	}
	
	var postMessage = postValue.message;
	var postMessageSharedContent = "";
	
	if (postValue.message == undefined)
	{
		postMessage = "";
	}


	if (postValue.name || postValue.description)
	{
		if (postValue.name != "Mobile Uploads" 
			&& postValue.name != "Timeline Photos" 
				&& (postValue.name.indexOf("Photos from") != 0) )
		{
			var messageAttachmentAlign = "";
			var messageAttachmentDescription = "";

			if (postValue.description)
			{
				messageAttachmentDescription = postValue.description;
			}
			else
			{
				if ( (postValue.link) && (postValue.link.indexOf("https://www.facebook.com") == 0) )
				{
					var shared_fid = postValue.link.replace("https://www.facebook.com/groups/", "");
					shared_fid = shared_fid.replace("/permalink/", "_");
					shared_fid = shared_fid.replace("/", "");
					if (typeof(groupPostsByFid[shared_fid]) != "undefined")
					{
						if (typeof(groupPostsByFid[shared_fid].message) != "undefined")
						{
							messageAttachmentDescription = groupPostsByFid[shared_fid].message;
						}
					}
				}
			}
			
			if (!(new RegExp(/[א-ת]/).test(messageAttachmentDescription)))
			{
				//No Hebrew
				messageAttachmentAlign = "ltrMessage";
			}
			
			postMessageSharedContent += "<div class='shadow postMessageSharedContent " + messageAttachmentAlign + "'>";
			if (postValue.picture)
			{
				postMessageSharedContent += "<img src='" + postValue.picture + "' />";
			}
			
			if (postValue.link)
			{
				postMessageSharedContent += "<a href='" + postValue.link +"' target='_BLANK' class='postMessageSharedContent_head'>";
			}
			
			if (postValue.name)
			{
				postMessageSharedContent += escapeHtml(postValue.name);
			}
			
			if (postValue.link)
			{
				postMessageSharedContent += "</a>";
			}
			
			if (messageAttachmentDescription)
			{
				postMessageSharedContent += "<p>" + nl2br(escapeHtml(messageAttachmentDescription)) + "</p>";
			}
			
			postMessageSharedContent += "<div style='clear:both;'></div></div>";
		}
	}
	/*
	if (postValue.name)
	{
		postMessage += "\n------------------------------------------\n" + postValue.name + "\n";
	}
	
	if (postValue.description)
	{
		postMessage += "\n" + postValue.description + "\n";
	}

	if (postValue.link)
	{
		postMessage += "\n" + postValue.link + "\n------------------------------------------\n";
	}
	*/
	
	if (postValue.caption)
	{
		if (postMessage.length > 0)
		{
			postMessage += '\n';
		}
		postMessage += postValue.caption.replace("Attachment Unavailable", "\nAttachment Unavailable\n") + "\n";
	}
	
	
	postMessage = escapeHtml(postMessage);
	var viewStatus = "";

	if (postValue.alreadySeen)
	{
		var old_message = "הודעה זו הייתה קיימת באחד הביקורים הקודמים שלכם";
		viewStatus = "<span class='secondary label shadow' title='"+old_message+"'>הודעה שנצפתה בעבר</span>";
	}
	else
	{
		var new_message = "הודעה זו חדשה ולא נצפתה בביקור קודם שלכם";
		viewStatus = "<span class='success label shadow' title='"+new_message+"'>הודעה חדשה!</span>";
	}
	
	var ajaxLoader = '';
	if (postValue.object_id)
	{
		//post has images
		ajaxLoader = "<a href='#' class='button tiny' onclick='return false;'>הצג תמונות</a>&nbsp;<!--img src='/images/ajax-loader.gif' /-->";
	}
	
	//var comments = nl2br(replaceKeywords(replaceURLWithHTMLLinks(comments)));
	
	var messageAlign = "rtl";
	if (!(new RegExp(/[א-ת]/).test(postMessage)))
	{
		//No Hebrew
		messageAlign = "ltr";
	}
	
	var messageDate = hebDate(postValue.created_time_parsed);
	
	var lastUpdateDate = hebDate(getDate(postValue.updated_time));

	var style = "";
	
	if (groupMetadata[postValue.mainGroup.id].groupFilter_visible == false)
	{
		//style += 'display: none; ';
	}
	

	var isFirstVisibleDup = false;
	if (isDup)
	{
		var postsFromDupBucket = $("div.duplicateBucket_" + postValue.duplicateBucket);
		if (postsFromDupBucket.filter( ":visible" ).length == 0)
		{
			isFirstVisibleDup = true;

			//Need to hide the non-visible dups that came before with a dup message
			postsFromDupBucket.filter(":hidden").each(function(){
				if (!$(this).hasClass("dup"))
				{
					$(this).addClass("dup")
						.find("div.mainPostContent:first")
						.after(getShowDupMessage($(this).attr("id").replace("post", "")));
				}
			});
		}
		
	}

	var savedState = "unsavedPost";
	if (typeof(savedPosts[postValue.id]) != "undefined")
	{
		savedState = "savedPost";
	}
	
	var filteredUser = "";
	if (typeof(blockedUsers[postValue.from.id]) != "undefined")
	{
		filteredUser = "filteredUser";
	}

	res = "";
		
	res += 	'<div class="panel shadow radius post '
		+ 'fromGroup_' + postValue.mainGroup.id + ' '
		+ 'fromUser_' +  postValue.from.id + ' ' 
		+ ((isDup && !isFirstVisibleDup) ? 'dup' : '') + ' '
		+ 'duplicateBucket_' + postValue.duplicateBucket + ' '
		+ ((postValue.alreadySeen) ? 'oldPost' : 'newPost') + ' ' 
		+ ((postKey % 2) ? 'postBackEven' : 'postBackOdd') + ' '
		+ savedState + ' ' 
		+ filteredUser + ' '
		+ ((groupMetadata[postValue.mainGroup.id].groupFilter_visible) ? '' : 'filteredGroup') + ' '
		+ '" style="' + style + '" id="post' + postKey + '">';
		
	if (!isMobile)
	{
		res +=  '<div class="panel shadow radius navButtons hide-for-small '
			+ ((postKey % 2) ? 'postBackEven' : 'postBackOdd') + ' '
			+ '"'
			+ ((windowWidth <= minWindowWidthForNavButtons) ? ' style="visibility:hidden;" ' : '') + ' '
			+ '>'
			+ '<a onclick="scrollFromPostToPost(' + postKey + ', -1);return false;" href="#">'
			+ '<img src="/images/bullet-arrow-up-icon.png" alt="ההודעה הקודמת" /></a>'
			+ '<br/><a onclick="scrollFromPostToPost(' + postKey + ', 1);return false;" href="#">'
			+ '<img src="/images/bullet-arrow-down-icon.png" alt="ההודעה הבאה" /></a></div>';
	}
		
	res +=	'<div class="postContentWrapper">';
	
	

	res += 		'<div class="th profilePic viewProfile" data-from-id="' + postValue.from.id + '"><a href="https://www.facebook.com/app_scoped_user_id/' 
				+ postValue.from.id + '" target="_BLANK">'
				+ '<img src ="https://graph.facebook.com/v2.3/' + postValue.from.id + '/picture" alt="תמונת פרופיל" />' 
				+ '</a></div>';
	res +=  	'<div style="margin-right: 80px;">';
	/*res += 			'<span class="postButtons hide-for-small"><a href="https://www.facebook.com/messages/' 
					+ postValue.from.id + '" target="_BLANK">' + 
						'<img src="/images/mail.png" title="שליחת הודעה פרטית" alt="שליחת הודעה פרטית" /></a>' +
					'</span>';*/

	if (isLocalStorageSupported)
	{
		res +=		'<span class="postButtons savePost">' +
						'<a href="#" onclick="changePostSavedState(' + postKey + '); return false;" title="שמירת ההודעה">&nbsp;</a>' +  
					'</span>';
	}
	
	if (isLocalStorageSupported)
	{
	
		res +=		'<span class="postButtons blockUser">' +
						'<a href="#" onclick="blockUserDialog(' + postKey + '); return false;" title="חסימת המשתמש">&nbsp;</a>' +  
					'</span>';
	}
	
	/*
	res += '<span class="postButtons postNum shadow panel radius secondary">#' + (postKey + 1) + '</span>';
	*/
					
	res += 			'<h4 class="postUser" style="margin: 0;">הודעה מאת ' + postValue.from.name + '</h4>';
							
	res += 			'<p class="postMainDetails">בקבוצת ' + '<a href="https://www.facebook.com/' 
						+ postValue.mainGroup.id + '/" target="_BLANK">' + postValue.mainGroup.name + '</a>' + "</p>";

	
	if (messageDate != "")
	{
		res += 		'<p class="postMainDetails"> בתאריך: ' + messageDate + '</p>';
	}
	res +=		'</div>';
	
	res += 		'<hr style="clear:both;" />';
	res +=		'<div class="mainPostContent" id="pid_' + postValue.id + '" data-post-mapping="' + postKey + '">';
	res +=  		'<p style="direction: '+messageAlign+'">' 
					+ nl2br(replaceKeywords(replaceURLWithHTMLLinks(postMessage))) + '</p>';

	if ( 
			(postValue.caption && postValue.caption.indexOf("Attachment Unavailable") !== -1) 
			|| 
			( (typeof(postValue.message) == "undefined") 
					&& (typeof(postValue.name) == "undefined")
					&& (typeof(postValue.picture) == "undefined")
					&& (typeof(postValue.object_id) == "undefined") )
		) 
	{
		res += "<p><b style='background:red; color: white'>ישנו תוכן נוסף שלא הוצג!</b> <br/><b>" + 
				"לעיון יש "; 
		if (!userIsLoggedIn)
		{
			res +=	"<a class='login_now_link' href='#login_now' onclick='return false;'>להתחבר לאתר</a>" + 
					" או ";
		}
		res +=	"להכנס ל<a href='http://www.facebook.com/" 
				+ postValue.id + "' target='_BLANK'>הודעה המקורית</a> בפייסבוק.</b></p>";
	}

	res +=		postMessageSharedContent;
					
	if (postValue.object_id)
	{
		res +=			'<p id="photos_' + postValue.id + '" class="postPhotos">' + ajaxLoader + '</p>';
	}

	if (comments.length > 0)
	{
		res +=		'<div id="post' + postKey + '_comments">';
		res += 			'<h4>תגובות:</h4>';
		res += 			comments;
		res +=		'</div>';
	}

	res +=			'<div id="post' + postKey + '_comments_from_other_posts" class="comments_from_other_posts">';
	if (isDup)
	{
		var otherComments, otherPostKey;
		var otherPostCommentsWrapper = $('#post' + dupId + '_comments');
		if (otherPostCommentsWrapper.length > 0)
		{
			//other post has comments - copy them here
			otherComments = otherPostCommentsWrapper.children("ul:first").clone();
			otherPostKey = otherComments.data("original-post-key");
			
			res += 	'<h4 class="similar_comments">תגובות מתוך ' 
				+ '<a href="https://www.facebook.com/' + groupPosts[otherPostKey].id
				+ '" target="_BLANK">הודעה כפולה</a> בקבוצת "' 
				+ groupPosts[otherPostKey].mainGroup.name + '"</h4>';
			res += $('<div>').append(otherComments).html(); //to get outer html (i.e. including the <ul>)
		}

		otherPostCommentsWrapper = $('#post' + dupId + '_comments_from_other_posts');
		if (otherPostCommentsWrapper.length > 0)
		{
			//copy the other post's dups here
			otherComments = otherPostCommentsWrapper.clone();
			res += otherComments.html();
		}
		
		$('div.duplicateBucket_' + postValue.duplicateBucket + ' div.comments_from_other_posts').each(function()
		{
			if (comments.length > 0)
			{
				//Add this comment set to each dup's dups
				$(this).append('<h4 class="similar_comments">תגובות מתוך ' 
								+ '<a href="https://www.facebook.com/' + postValue.id
								+ '" target="_BLANK">הודעה כפולה</a> בקבוצת "' 
								+ postValue.mainGroup.name + '"</h4>' + comments);
			}

		});	
		
	}
	res +=			'</div>';
	
	res += 			'<h4>פרטים נוספים:</h4>';
	
	res += 			'<table class="post_details shadow">';

	res += 				'<tr>';
	res += 					'<th>';	
	res += 						'סטטוס צפייה:';
	res += 					'</th>';
	res += 					'<td>';	
	res += 						viewStatus;
	res += 					'</td>';
	res += 				'</tr>';

	if (lastUpdateDate != "")
	{
		res += 			'<tr>';
		res += 				'<th>';	
		res += 					'עדכון אחרון:';
		res += 				'</th>';
		res += 				'<td>';	
		res += 					lastUpdateDate;
		res += 				'</td>';
		res += 			'</tr>';
	}

	res += 				'<tr>';
	res += 					'<td colspan="2" class="link_to_FB">';	
	res += 						'<a href="http://www.facebook.com/' 
								+ postValue.id + '" target="_BLANK">פתיחת ההודעה המקורית בפייסבוק (בחלון חדש)</a>';
	res += 					'</td>';
	res += 				'</tr>';

	res += 			'</table>';
	res +=		'</div>';
	
	if (isDup && !isFirstVisibleDup)
	{
		res +=	getShowDupMessage(postKey);
	}
	
	res += 	'</div></div>';

	
	//$('#posts').append(res);
	var newElement = $(res).appendTo('#posts');
	
	if (postValue.object_id)
	{
		$('#post' + postKey).waypoint({
			handler: function() {
				if ( (!waypointsDisabled) && ($('#post' + postKey).is(":visible")) )
				{
					//console.log("GetPhotos for ", postKey);
					getPhotos(postValue.object_id, postValue.id, postKey);
					$('#post' + postKey).waypoint('destroy');
				}
			},
			triggerOnce: false,
			offset: '95%'
		});

		$('#photos_' + postValue.id + ' a').click(function(){
			$(this).remove();
			getPhotos(postValue.object_id, postValue.id, postKey);
			$('#post' + postKey).waypoint('destroy');
			return false;
		});
	}

	if (filterFunc)
	{
		filterFunc(postKey, newElement);
	}
};

//console.log(groupIds)

function getGroupBatchQuery(needAllGroups, myGroupsNext)
{
	var groupBatch = [];
	
	if (needAllGroups)
	{
		groupBatch.push({
			'method': 'GET', 
			'name': 'the_groups', 
			//'relative_url':'fql?q=select gid, name, privacy from group where gid in (' + groupIds.join(",") + ')'
			'relative_url':'?ids=' + groupIds.join(",") /*+ '&fields=name,privacy,id'*/
		});
	}
	
	/*
	groupBatch.push({
		'method': 'GET', 
		'name': 'my_groups', 
		//'relative_url':'fql?q=select gid from group_member where uid = ' + FBuser.id
		'relative_url': 'me/groups?limit=200' + myGroupsNext
	});
	*/
	
	var FbApiVars = {batch: groupBatch};
	
	if (!userIsLoggedIn)
	{
		FbApiVars.access_token = accessToken;
	}
	
	return FbApiVars;
}


function getNextGroupBatch(depth, FbApiVars, myGroupIds, theGroupsIds)
{
	//console.log(FbApiVars)
	FB.api('/v2.3/', 'POST', FbApiVars, function (response) {
		//console.log(response);
		
		if (!response || !response[0])
		{
			logResponse("Error: Facebook AllGroup query returned no response");
			return;
		}
		
		if (depth == 0)
		{
			//Batch includes theGroups and myGroups
			var theGroups = response[0];
			
			if (theGroups["code"] != 200)
			{
				logResponse("Error: Facebook AllGroup query returned status code " + theGroups["code"]);
				return;
			}
			
			if (!theGroups["body"])
			{
				logResponse("Error: Facebook AllGroup has no body");
				return;
			}
			
			theGroupsIds = JSON.parse(theGroups["body"]);
			
			if (!theGroupsIds)
			{
				logResponse("Error: Facebook AllGroup has no data");
				return;
			}
			
			//var myGroups = response[1];
		}
		else
		{
			//Only myGroups, since this is a pagination
			//var myGroups = response[0];
		}

		//console.log(myGroups)
		/*
		if (myGroups["code"] != 200)
		{
			logResponse("Error: Facebook myGroups query returned status code " + myGroups["code"]);
			return;
		}
	
		if (!myGroups["body"])
		{
			logResponse("Error: Facebook myGroups has no body");
			return;
		}
	
	
		myGroups = JSON.parse(myGroups["body"]);
	
		if (!myGroups["data"])
		{
			logResponse("Error: Facebook myGroups has no data");
			return;
		}
		
		$.each(myGroups["data"], function(key, val) {
			if (val.id) {
				myGroupIds.push(val.id);
			}
		});
		
		var myGroupsNext = "";
		//we have paging if there is a "next" element
		if (myGroups["paging"] && myGroups["paging"]["next"] && myGroups["paging"]["cursors"] && myGroups["paging"]["cursors"]["after"])
		{
			myGroupsNext = "&after=" + myGroups["paging"]["cursors"]["after"];
		}
		var newFbApiVars = getGroupBatchQuery(false, myGroupsNext);
			
		if (depth == 10 || myGroupsNext == "") //10 is an arbitrary limit
		*/
		if (true)
		{
			//final call, just show the results
			var res = "";
			
			res +=	"<ul id='allGroupsUl'>";
			$.each(theGroupsIds, function(key, val) {
				var isClosedGroup = val.privacy && val.privacy.toLowerCase() == "closed";
				//var isMember = $.inArray(val.id.toString(), myGroupIds) > -1;
				
				if (!isClosedGroup)
				{
					return true; //continue
				}
				
				res += "<li><a href='https://www.facebook.com/" + val.id + "' target='_BLANK'>" + val.name + "</a>";
				res += "<ul><li>";
				res += (isClosedGroup) ? "<span style='color: purple;'>קבוצה סגורה</span>" 
							: "<span style='color: blue;'>קבוצה פתוחה</span>" ;
				/*res += ", ";
				res += (isMember) ? "<span style='color: green;'>הינכם חברים בה</span>" 
							: "<span style='color: red;'>אינכם חברים בה</span>";
				*/			
				res += " - ";
				//res += ( (!isClosedGroup) || (isMember) ) ? "הודעות מקבוצה זו מוצגות כעת" : "עליכם להצטרף לקבוצה על מנת לצפות בהודעות ממנה" ;
				//res += ( (!isClosedGroup) ) ? "הודעות מקבוצה זו יוצגו תמיד" : "ודאו שהנכם חברים בקבוצה על מנת לצפות בהודעות" ;
				res += ( (!isClosedGroup) ) ? "הודעות מקבוצה זו יוצגו תמיד" : "לא ניתן להציג הודעות מקבוצה זו, בדקו אותה עצמאית" ;
				res += "</li></ul></li>";
			});
			res += "</ul>";
			
			$("#allGroupsContent").html(res).css("text-align", "right");
			allGroupsAlreadyLoaded = true;
			$.fancybox.update();
		}
		else
		{
			//We're going in!
			/*
			if (myGroupsNext != "")
			{
				getNextGroupBatch(depth + 1, newFbApiVars, myGroupIds, theGroupsIds);
			}
			*/
		}
		
	});
}

function getAllGroups()
{
	var myGroupIds = [];
	var theGroupsIds = [];
	getNextGroupBatch(0, getGroupBatchQuery(true, ""), myGroupIds, theGroupsIds);
	
};

var globalErr;




var returningCalls = 0;
function fallback()
{
 
	$.each(groupIds, function (groupIdKey, groupIdVal) {
		setTimeout(function(){
			$.ajax({
				url:"https://graph.facebook.com/v2.5/" 
					+ groupIdVal + "/feed?limit=" 
					+ postsPerGroup + "&access_token=" + accessToken,
				dataType: 'jsonp', // Notice! JSONP <-- P (lowercase)
				success:function(json){
					//groupPosts.push.apply(groupPosts, json.data);
					groupPosts = groupPosts.concat(json.data);
					++returningCalls;

					//if (groupIdKey == 0)
					if (returningCalls == groupIds.length)
					{	
						//this is the last group, proceed to the next stage - show posts
						groupPosts = $.map(groupPosts, mapPosts);
						groupPosts.sort(sortPosts);
						printPosts();
					}
				 },
				 error: function(msg){
				 	++returningCalls;
					logResponse("Error: " + msg);
				 }
			});
		}, 1500 * groupIdKey);
	});
};

function mapPosts(post, postIndex)
{
	//console.log(post)
	
	if (post && post.from && post.from.id)
	{
		if ( (typeof(post.to) == "undefined") && ($.inArray(post.from.id, groupIds) > -1) )
		{
			post.to = {data: [post.from]};
		}
		
	}
	if (post && post.to)
	{
		$.each(post.to.data, function (key, val){
			if ($.inArray(val.id, groupIds) > -1)
			{
				
				post.mainGroup = {id: val.id, name: val.name};
				//Save the name
				groupMetadata[val.id] = {
							name: val.name,
							num_dups: 0 //not including the original post
				};
			}
		});
	}
	else
	{
		groupPostsLength--;
		return null;
	}

	if (typeof(post.mainGroup) == "undefined")
	{
		groupPostsLength--;
		return null;
	}
	
	post.alreadySeen = false;

	groupPostsByFid[post.id] = post;
	
	if (post.created_time)
	{
		post.created_time_parsed = getDate(post.created_time);
		if (isNaN(post.created_time_parsed))
		{
			//can't handle getDate
			return post;
		}
		if (current_date - post.created_time_parsed < post_invalidity_time)
		{
			if ( (chosenLastTimeStamp != null) && (post.created_time_parsed.getTime() <= chosenLastTimeStamp) )
			{
				post.alreadySeen = true;
				++g_numOldPosts;
			}
			return post;
		}
		else
		{
			return null;
		}
	}
	else
	{
		return null;
	}
}

function start(){
	//clearTimeout(loaderWatchDog);
	var feedBatch = [];
	$.each(groupIds, function (groupIdKey, groupIdVal) {
		var currentQuery = {};
		currentQuery["method"] = "GET";
		//currentQuery["relative_url"] = groupIdVal + "?fields=feed.limit(" + postsPerGroup + ").fields(to,id,message,description,caption,name,link,picture,created_time,object_id,updated_time,from,comments.fields(from,message,message_tags))";
		currentQuery["relative_url"] =  groupIdVal + "/feed/?limit=" + postsPerGroup 
										+ "&fields=to,id,message,description,caption,name,link,picture,created_time,"
										+ "object_id,updated_time,from,comments.fields(from,message,message_tags)";
										
		if (true)
		{
			currentQuery["relative_url"] += "&since=2 weeks ago";
		}
		
		if (userIsLoggedIn)
		{
			currentQuery["relative_url"] = currentQuery["relative_url"].replace("comments.fields(from,message,message_tags)",
										"comments.fields(from,message,message_tags,attachment)");
		}

		currentQuery["relative_url"] = encodeURIComponent(currentQuery["relative_url"]);
		feedBatch.push(currentQuery);
	});
	
	/*
	var joined_ids = groupIds.join(",");
	var url = "feed/?include_headers=false&ids=" + joined_ids + "&limit=" + postsPerGroup 
				+ "&fields=to,id,message,description,caption,name,link,picture,created_time,"
				+ "object_id,updated_time,from,comments.fields(from,message,message_tags)";
	
	//url += "&" + encodeURIComponent("since=2 weeks ago");
	
	if (userIsLoggedIn)
	{
		url = url.replace("comments.fields(from,message,message_tags)",
									"comments.fields(from,message,message_tags,attachment)");
	}
	
	url += "&access_token=" + accessToken;
	
	//url = encodeURIComponent(url);
	*/
	if (typeof(JSON) != "undefined")
	{
		$.ajax({
			url: "https://graph.facebook.com/?include_headers=false&batch=" + JSON.stringify(feedBatch) + "&access_token="+accessToken,
			//url: "https://graph.facebook.com/" + url,
			dataType: 'json',
			type: 'POST',
			crossDomain: true,
			success:function(json){	
				//console.log(json)
				if ($.isArray(json))
				{
					$.each(json, function (feedKey, feedVal) {
						//console.log(feedKey, feedVal)
						if (!feedVal)
						{
							logResponse("Error: feedVal is NULL");
							return true; // == continue
						}
						
						if (!feedVal.code)
						{
							logResponse("Error: Facebook query didn't return a status code");
							return true; // == continue
						}
				
						if (feedVal.code != 200)
						{
							logResponse("Error: Facebook query returned status code " + feedVal.code 
									+ " for group id " + groupIds[feedKey]);
							//console.log(feedVal)
							return true; // == continue
						}
				
				
						if (!feedVal.body) 
						{
							return true; // == continue
						}
				
						var feedBody = JSON.parse(feedVal.body);
				
						if ( (!feedBody) || (!feedBody.data) )
						{
							logResponse("Error: Facebook query could not display data" 
									+ " for group id " + groupIds[feedKey]);
							return true; // == continue
						}
				
						//console.log(feedBody.data);
								
						groupPosts = groupPosts.concat(feedBody.data);
				
					});
					
					//console.log("before: ", groupPosts.length);
					groupPosts = $.map(groupPosts, mapPosts);
					//console.log("after: ", groupPosts.length);
					groupPosts.sort(sortPosts);
					printPosts();
				}

			 },
			 error: function(msg){
			 	//Old IE browsers get here.
			 	globalErr = msg;
				logResponse("Error: " + msg);
				fallback();
			 }
		});
	}
	else
	{
		fallback();
	}
}

if (typeof(debugStart) == "function")
{
	debugStart();
}

function calculateShownPosts() 
{
	var oldPostsParsed = $("#posts div.oldPost");
	var newPostsParsed = $("#posts div.newPost");
	var numOldPostsParsed = oldPostsParsed.length;
	var numNewPostsParsed = newPostsParsed.length;
	var numParsedPosts = numOldPostsParsed + numNewPostsParsed;
	var numShownOldPosts = oldPostsParsed.filter(":visible").length;
	var numShownNewPosts = newPostsParsed.filter(":visible").length;
	var numShownPosts = numShownOldPosts + numShownNewPosts; //$("#posts div.post").filter(":visible").length;
	var numFilteredGroupPosts =  $("#posts div.filteredGroup").length;
	var numFilteredUserPosts =  $("#posts div.filteredUser").length;
	var numDupPosts = 0; //$("#posts div.dupPost, #posts div.dup").length;
	var numfilteredPosts = 0; //$("#posts div.filteredOut").length;
	var numGroupsToShow = 0; //$("#groupListUl input[type=checkbox]:checked").length;
	//var additionalText = [];
	var moreOptions = new Array();

	$.each( groupMetadata, function( groupId, groupData ) {
		//Show the number of filtered posts as the sum of posts that would
		//have been shown if there was no filter
		if (groupData.groupFilter_visible == true)
		{
			numGroupsToShow++;
			numDupPosts += groupData.num_dups;
			numfilteredPosts += $("#posts div.fromGroup_" + groupId + ".filteredOut").length;
		}
	});

	var dupsAreHidden = (numDupPosts > 0) && ($("#hideDupd_cb").is(':checked'));
	
	var showingOnlyFavs = $("#showFavorites_cb").is(':checked');
	
	var text = "בשבועיים האחרונים פורסמו " + groupPostsLength + " הודעות, מתוכן " + (groupPostsLength - g_numOldPosts) + " הודעות חדשות (כולל הודעות כפולות)." + "<br/>";

	text += numParsedPosts + " ההודעות האחרונות נטענו, מתוכן " + numNewPostsParsed + " חדשות ו-" + numOldPostsParsed + " שנצפו בעבר";

	if (numParsedPosts != groupPostsLength)
	{
		text += ". ניתן לטעון עוד בתחתית הדף";
	}
	
	text += ".<br/>";
	
	text += "מציג כרגע " + numShownNewPosts + " הודעות חדשות. ";
		
	if (numShownOldPosts > 0)
	{
		text += " בנוסף, מציג " + numShownOldPosts + " הודעות שנצפו בעבר.";
	}

	/*
	if ( dupsAreHidden || numFilteredGroupPosts > 0)
	{
		text += "<br/>";
		if (dupsAreHidden)
		{
			text += "" + numDupPosts + " הודעות מוסתרות לחלוטין מכיוון שזוהו כהודעות כפולות. ";
		}
		
		if (numFilteredGroupPosts > 0)
		{
			text += "" + numFilteredGroupPosts + " הודעות מוסתרות בעקבות סינון הקבוצות.";
		}
		
		if (numFilteredUserPosts > 0)
		{
			text += "" + numFilteredUserPosts + " הודעות מוסתרות בעקבות חסימת משתמשים.";
		}	
	}
	*/
	if (numShownPosts < numParsedPosts)
	{
		text += "<br/>";
		var hiddenPostReason = [];
		
		if (dupsAreHidden)
		{
			hiddenPostReason.push("זיהוי כהודעות כפולות");
		}
		
		if (numFilteredGroupPosts > 0)
		{
			hiddenPostReason.push("סינון קבוצות");
		}
		
		if (numFilteredUserPosts > 0)
		{
			hiddenPostReason.push("חסימת משתמשים");
		}
		
		if (numfilteredPosts > 0)
		{
			hiddenPostReason.push("אי-התאמה למילות המפתח");
		}
		
		if (showingOnlyFavs)
		{
			hiddenPostReason.push("צפייה בהודעות מועדפות בלבד");
		}
		
		
		
		
		if (hiddenPostReason.length > 0)
		{
			text += (numParsedPosts - numShownPosts) + " הודעות מוסתרות לחלוטין עקב " + hiddenPostReason.join(" / ") + ".";
		}
	}
	
	

	if (showingOnlyFavs)
	{
		text += "<br/>" + "מציג רק הודעות מועדפות" 
				+ ' (<a href="#" onclick="favoritesDisplayOptions(false);calculateShownPosts(); return false;">הצג גם הודעות שאינן מועדפות</a>).';
	}

	/*
	if (numDupPosts > 0)
	{
		additionalText.push(numDupPosts + " הודעות מסומנות ככפולות");
	}
	*/

	var noPostReason = "";
	if (numfilteredPosts > 0)
	{
		/*additionalText.push(numfilteredPosts + " הודעות מסוננות [מילת מפתח: "
				+ "<b id='displayedSearchTerm'></b>" 
				+ "]");*/
		moreOptions.push("לסנן לפי מילות מפתח אחרות");
		var numPostsWithNoMatch = numfilteredPosts;
		if ($("#hideDupd_cb").is(':checked'))
		{
			numPostsWithNoMatch -= numDupPosts;
		}
		
		if (showingOnlyFavs)
		{
			noPostReason = "כל ההודעות המועדפות שנטענו אינן מתאימות למילות המפתח"; 
		}
		else
		{
			noPostReason = "כל " + numPostsWithNoMatch + " ההודעות שנטענו אינן מתאימות למילות המפתח";
		}
	}

	/*
	additionalText = additionalText.join(" | ");
	if (additionalText != "" && numGroupsToShow > 0)
	{
		text += "<br/>" + additionalText + ".";
	}
	*/

	var searchTerm = $("#searchBox").val();
	if (searchTerm == search_placeholder)
	{
		//IE8 bug?
		searchTerm = "";
	}
	
	if (searchTerm != "")
	{
		var hasParentheses = searchTerm.indexOf('"') != -1;
		text += "<br/>מציג תוצאות עבור מילות המפתח: ";
		text += (hasParentheses) ? '[' : '"';
		text += "<b id='displayedSearchTerm'></b>";
		text += (hasParentheses) ? ']:' : '":';
	}
	
	$("#num_posts").html(text);
	$("#displayedSearchTerm").text(searchTerm);
	
	if (numParsedPosts == groupPostsLength)
	{
		$("#showOldPosts").hide();
	}
	else
	{
		$("#showOldPosts").show();
		moreOptions.push("לטעון הודעות נוספות");
	}

	if (numShownPosts == 0)
	{
		if ($("#showFavorites_cb").is(':checked'))
		{
			moreOptions.push("להציג גם הודעות שאינן מועדפות");
		}
		
		if (numGroupsToShow > 0)
		{
			moreOptions = moreOptions.join(" / ");
		}
		else
		{
			moreOptions = "לבחור קבוצה אחת לפחות";
		}

		if ($("#postsWrapper").is(":visible"))
		{
			//Don't show this if we're in the "about" screen
			$("#num_posts_message").html(" | אין הודעות להצגה |" 
											+ "<br/>"
											+ noPostReason
											+ "<br/>" 
											+ "נסו "
											+ moreOptions).slideDown();
		}
	}
	else
	{
		$("#num_posts_message").slideUp();
	}

	//Make sure no post has an explicit "display" attribute at this stage,
	//since it messes up filters
	//$("#posts div.post").css('display', '');
	$.waypoints('refresh');
};


function hideFilteredGroups()
{
	$("#groupListUl li input:not(:checked)").each(function(){
		$("#posts div.fromGroup_" + $(this).val()).addClass("filteredGroup");
	});
}


function showGroupList()
{
	var res = "";
	
	res += "<ul id='groupListUl' style='margin-right: 0.8em;'>";
	
	$.each( groupMetadata, function( groupId, groupData ) {
		var groupIndex = $.inArray(groupId, groupIds);
		if (groupIndex < 0) {
			return true; // == continue
		}
		
		var checked = "";
		if (chosenGroupFilter & (1 << groupIndex))
		{
			checked = ' checked="checked" ';
			groupData.groupFilter_visible = true;
		}
		else
		{
			groupData.groupFilter_visible = false;
		}
		
		res += "<li>";
		res +=		"<input type='checkbox' name='groupsToShow' id='groupToShow_" + groupId + "' class='groupsToShow' "
				+ checked + " value='" + groupId + "' />";
				
		res +=		"<label for='groupToShow_" + groupId + "'>" + groupData.name 
				+ " <a href='http://www.facebook.com/" + groupId 
				+ "' target='_BLANK'><img src='/images/icon-external-link2.gif' alt='פתיחה בחלון חדש' /></a>" 
				+ "</label>";
		
		res +=	"</li>";
	});
	
	res += "</ul>";
	
	$("#groupList").html(res);
};

function performServerAction(info)
{
	if (userIsLoggedIn)
	{
		$.ajax({
			type: "POST",
			url: "/action.php",
			data: 	info,
			success: function(data){
					logResponse(data);
			},
			error: function(data){
				logResponse(data);
			},
			dataType: "json"
		});
	}
};

function showOldPosts()
{
	var lastShownPostId = parseInt($("#posts div.post:last").attr('id').replace("post",""));
	printPostsAsync(lastShownPostId+1, groupPostsLength, maxOldPostsToShow, function(){
		hideFilteredGroups();
		calculateShownPosts();
		updateOldPostText();
		$("#showOldPosts a").show();
		$("#showOldPosts img").hide();
	});
	$("#showOldPosts a").hide();
	$("#showOldPosts img").show();
	return false;
};

function printPostsAsync(startId, endId, maxOldPostsToShow, callback)
{
	(function(n) {
	    var i = startId;
	    var numOfOldPosts = 0;

	    function doWork() {
			printPost( groupPosts[i], i );
			if (typeof (groupPosts[i].alreadySeen) != "undefined" && groupPosts[i].alreadySeen)
			{
				++numOfOldPosts;
			}

			var maxPostsReached = false;
			if ( (i % maxPostsPerLoad == 0) && (i > 0) )
			{
				maxPostsReached = true;
			}
	
			if ( (++i < n) && (numOfOldPosts < maxOldPostsToShow) && (!maxPostsReached) ) {
			    setTimeout(doWork, 0);
			} else {
				if (callback != null) 
				{
					callback();
				}
			}
	    }

	    doWork(); // start the first iteration
	})(endId);
};

function loadBlockedUsers()
{
	if (!isLocalStorageSupported)
	{
		return;
	}
	
	if (blockedUsers.length > 0)
	{
		//already loaded
		return;
	}

	var bu = localStorage["blockedUsers"];
	if (bu)
	{
		try {
			blockedUsers = JSON.parse(bu);
		}
		catch (e)
		{
			logResponse("Error in loadBlockedUsers()!");
		}
	}
};

function loadSavedPosts()
{
	if (!isLocalStorageSupported)
	{
		return;
	}

	var hasChange = false;

	var sp = localStorage["savedPosts"];
	if (sp)
	{
		savedPosts = JSON.parse(sp);
	}

	try 
	{
		//Get rid of old posts
		for (var i in savedPosts)
		{
			if (savedPosts[i].created_time_parsed != null)
			{
				if (current_date - savedPosts[i].created_time_parsed < post_invalidity_time)
				{
					delete savedPosts[i];
					hasChange = true;
				}
			}
		}
	}
	catch (e)
	{
		logResponse("Error in loadSavedPosts()!");
	}

	if (hasChange)
	{
		localStorage["savedPosts"] = JSON.stringify(savedPosts);
	} 
	
};

function printPosts() {
	//console.log(groupPosts);
	
	$("#loadingPosts").hide().children("span").text("מפעיל סינון...");
	
	showGroupList();

	loadSavedPosts();
	
	loadBlockedUsers();
	
	$("#posts").html('');
	
	groupPostsLength = groupPosts.length;
	
	if (groupPostsLength > 0)
	{
		printPostsAsync(0, groupPostsLength, maxOldPostsToShow, printPostsWrapup);
	} 
	else 
	{
		//$("#posts").html('<p style="color: red;">שגיאה: פייסבוק מגבילים את כמות הקריאות לשירות שלהם בטווח של 5 דקות. אנא המתינו מספר דקות ונסו בשנית.</p>');
		$("#posts").html('<p style="color: red;">שגיאה: פייסבוק הגבילו את הגישה לקבוצות פתוחות והם דורשים אישור פרטני עבור כל אתר שמנסה לגשת למידע זה. התחלנו בתהליך האישור ואנחנו מקווים לשוב לחיים בהקדם...</p>');
	}
};

function updateOldPostText()
{

	var AfterLastShownPostId = parseInt($("#posts div.post:last").attr('id').replace("post","")) + 1;

	var oldPostButton = $("#showOldPostsA");

	if (AfterLastShownPostId <= groupPostsLength - 1)
	{
		if (groupPosts[AfterLastShownPostId].alreadySeen)
		{
			oldPostButton.text("הצג הודעות נוספות שנצפו בעבר");
			oldPostButton.removeClass("additional_new_posts");
			maxOldPostsToShow = 30;
		}
		else
		{
			oldPostButton.text("הצג הודעות נוספות");
			oldPostButton.addClass("additional_new_posts");
		}
		
		
	}
	
};

function printPostsWrapup()
{
	$("#num_posts").show();
	
	hideFilteredGroups();

	$("#posts").after( '<div class="large-12 columns" id="showOldPosts">' 
			+ '<span id=""></span>'
			+ '<a onclick="showOldPosts(); return false;" class="medium radius button" href="#" id="showOldPostsA">הצג הודעות נוספות</a>'
			+ '<img src="/images/ajax-loader.gif" alt="Loading..." style="display:none;"/></div>' );
	
	updateOldPostText();
	
	calculateShownPosts();
	
	$( "body" ).keypress(function(event) {
		if ($("#searchBox").is(":focus"))
		{
			return;
		}
		switch (event.which)
		{
			case 107: //k
			case 75: //K
			case 1500: //ל
				scrollToPost(-1);
				break;
			case 106: //j
			case 74:  //J
			case 1495: //ח
				scrollToPost(1);
				break;
			default:
				break;
		}
	});

	$("#groupListUl input.groupsToShow").change(function() {
		var groupId = $(this).val();
		var groupIndex = $.inArray(groupId, groupIds);
		var groupElements;

		if ($(this).is(':checked'))
		{
			//$("#posts div.fromGroup_" + groupId).not("div.dup").fadeIn("slow", function(){calculateShownPosts();});
			chosenGroupFilter = chosenGroupFilter | (1 << groupIndex);
			groupMetadata[groupId].groupFilter_visible = true;
			groupElements = $("#posts div.fromGroup_" + groupId);
			if (groupElements.length > 0)
			{
				$.when(groupElements.each(function(){
					$(this).removeClass("filteredGroup");
					$(this).animate({opacity: 1}, "slow", "swing");
				})).then(function () {
					calculateShownPosts();
				});
			}
		}
		else
		{
			//$("#posts div.fromGroup_" + groupId).fadeOut("slow", function(){calculateShownPosts();});
			chosenGroupFilter = chosenGroupFilter & (~(1 << groupIndex));
			groupMetadata[groupId].groupFilter_visible = false;
			groupElements = $("#posts div.fromGroup_" + groupId);
			if (groupElements.length > 0)
			{
				$.when(groupElements.animate({opacity: '0'}, "slow", "swing", function(){
					$(this).addClass("filteredGroup");
				})).then(function () {
					calculateShownPosts();
				});
			}
			
		}
		
		setCookie(groupFilterCookieName, chosenGroupFilter, 365); //one year

	}); 
	
	setTimeout(function(){
		setCookie("lastTimeStamp_" + cookieSuffix, currentTimestamp, 365); //one year

		performServerAction(create_server_lastvisit_data(currentTimestamp));
		
	}, 30000); //30 seconds
	
	logResponse("Site loaded in " + ((new Date().getTime() - currentTimestamp)/1000) + " seconds.");
};

function sortPosts(a, b) {
/*
	aDate = getDate(a.created_time);
	bDate = getDate(b.created_time);
	return (aDate > bDate) ? -1 : 1;
*/
	return (a.created_time_parsed > b.created_time_parsed) ? -1 : 1;
};
