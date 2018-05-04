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

function is_html5_storage_supported() {
try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

function getDate(dateStr)
{
	dateStr = dateStr.replace("+0000", "+00:00");
	return new Date(dateStr);
};

function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
};

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
};

function isValidDate(d) {
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
};

function hebDate(date)
{
	if (!isValidDate(date))
	{
		return "";
	}
	var hebDays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
	var ret = "";
	ret += "יום " + hebDays[date.getDay()] + ", ";
	ret += date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + ", ";
	ret += "בשעה ";
	ret += ((date.getHours() < 10) ? "0"+date.getHours() : date.getHours()) + ":" 
		+ ((date.getMinutes() < 10) ? "0"+date.getMinutes() : date.getMinutes());
	return ret;
};

var nl2brRegex = new RegExp(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g);

function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(nl2brRegex, '$1' + breakTag + '$2');
};



var linksRegex = new RegExp(/(\b(https?|ftp|file):\/\/[-א-תA-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);

function replaceURLWithHTMLLinks(text) {
    return text.replace(linksRegex,"<a target='_BLANK' href='$1'>$1</a>"); 
};

function escapeRegExp(s, i) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function buildListRegexFromArray(arr)
{
	var res = "";
	res = $.map( arr, escapeRegExp);
	res = res.join("|");
	return res;
};

function logResponse(response) 
{
	if (typeof(console) == "undefined")
	{
		return;
	}
	
	if (typeof(console.log) == "undefined")
	{
		return;
	}
	
	if (console && console.log) {
		console.log('Log: ', response);
	}
};


//http://stackoverflow.com/questions/295566/sanitize-rewrite-html-on-the-client-side
var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

var tagOrComment = new RegExp(
    '<(?:'
    // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
    // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
    // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');
function removeTags(html) {
  var oldHtml;
  do {
    oldHtml = html;
    html = html.replace(tagOrComment, '');
  } while (html !== oldHtml);
  return html.replace(/</g, '&lt;');
}


// -----

function getMultisetFromArr(splt)
{
	var map = {};
	for (var i in splt)
	{
		var x = splt[i];
		if(x in map)
		{
			map[x] += 1;
		}
		else
		{
			map[x] = 1;
		}
	}
	return map;
}

function getMultisetSize(m)
{
	var count = 0;
	for (var key in m)
	{
		count += m[key];
	}
	return count;
}

function getMultisetIntersection(m1, m2)
{
	var isect = {};
	var smallMultiset = (m1.length < m2.length) ? m1 : m2;
	var largeMultiset = (m1.length < m2.length) ? m2 : m1;
	for(var key in smallMultiset) // Iterate over the smaller multiset on the outside loop.
	{
		if(key in largeMultiset)
		{
			isect[key] = (smallMultiset[key] < largeMultiset[key]) ? smallMultiset[key] : largeMultiset[key]; // Take the minimum
		}
	}
	return isect;
}

function multisetDiff(multiset1, multiset2)
{
	var m1Size = getMultisetSize(multiset1);
	var m2Size = getMultisetSize(multiset2);
	var unionSize = m1Size + m2Size; // Size of the union of the two multisets
	var isectSize = getMultisetSize(getMultisetIntersection(multiset1,multiset2)); // Size of the intersection of the two multisets
	
	var diceCoefficient = (2*isectSize) / unionSize;
	return diceCoefficient;
}