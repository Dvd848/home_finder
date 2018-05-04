<?php

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

if (__FILE__ == $_SERVER['DOCUMENT_ROOT'].$_SERVER['PHP_SELF']){
  die("Direct access forbidden");
}


function printServerPosts($facebook, $postsPerGroup, $groupIds)
{
	$groupNames = array();
	
	$queries = array();
	foreach ($groupIds as $groupIdKey => $groupIdVal)
	{
		$currentQuery = array();
		$currentQuery["method"] = "GET";
		$currentQuery["relative_url"] = $groupIdVal . "?fields=feed.limit(" . $postsPerGroup . ").fields(to,comments,id,message,description,caption,name,created_time,object_id,updated_time,from)";
		$queries[] = $currentQuery;
	}

	// POST your queries to the batch endpoint on the graph.
	$batchResponse = $facebook->api('?batch='.json_encode($queries).'&access_token='.$facebook->getAccessToken(), 'POST');

	if (!$batchResponse)
	{
		return "שגיאה 1";
	}
	
	if (!is_array($batchResponse))
	{
		return "שגיאה 2";
	}
	
	foreach ($batchResponse as $resVal)
	{
		if (isset($resVal['body']))
		{
			$allPosts = json_decode($resVal['body'], true);
			if (!is_array($allPosts))
			{
				continue;
			}
			
			if ( (!array_key_exists('feed', $allPosts)) || (!is_array($allPosts['feed'])) )
			{
				continue;
			}
			
			if ( (!array_key_exists('data', $allPosts['feed'])) || (!is_array($allPosts['feed']['data'])) )
			{
				continue;
			}
				
			foreach ($allPosts['feed']['data'] as $post)
			{
				$mainGroup = printPost($post, $groupIds);
				$groupNames[$mainGroup['id']] = $mainGroup['name'];
			}
		}
	}
	
	return $groupNames;

}

function printPost($postValue, $groupIds)
{
	$mainGroup = array();
	
	$toList = array();
	if (isset($postValue['to']))
	{
		foreach ($postValue['to']['data'] as $key=>$val)
		{
			if (in_array($val['id'], $groupIds))
			{
				$toList[] = '<a href="https://www.facebook.com/' 
						. $val['id'] . '/" target="_BLANK">' . htmlspecialchars($val['name']) . '</a>';

				$mainGroup = $val;
			}
		}
	}
	
	if (count($mainGroup) == 0)
	{
		return;
	}
	
	
	$comments = "";
	if (isset($postValue['comments']))
	{
		$comments = "<ul class='post_comments' style='margin-right: 2.5em;'>";
		foreach($postValue['comments']['data'] as $key => $val)
		{
			if (empty($val['message']))
			{
				$val['message'] = "<span style='background: gray;'>לא ניתן להציג תגובה זו</span>";
			}
			$comments .= "<li><b>" . htmlspecialchars($val['from']['name']) . ":</b><br/> " . htmlspecialchars($val['message']) . " </li>";
		}
		
		if (!empty($postValue['comments']['paging']) && !empty($postValue['comments']['paging']['next']))
		{
			$comments .= "<li><b>קיימות תגובות נוספות שאינן מוצגות. להצגה יש לפתוח את ההודעה המלאה:</b><br/>http://www.facebook.com/" . $postValue['id'] . "</li>";
		}
		
		$comments .= "</ul>";
	}
	

	if (empty($postValue['message']))
	{
		$postValue['message'] = "";
		
		if (!empty($postValue['description']))
		{
			$postValue['message'] .= htmlspecialchars($postValue['description']) . "\n";
		}
		
		if (!empty($postValue['caption']))
		{
			$postValue['message'] .= htmlspecialchars($postValue['caption']) . "\n";
		}
		
		if (!empty($postValue['name']))
		{
			$postValue['message'] .= htmlspecialchars($postValue['name']) . "\n";
		}
	}
	else
	{
		$postValue['message'] = htmlspecialchars($postValue['message']);
	}
	
	if (!empty($postValue['caption']) && (strpos($postValue['caption'], "Attachment Unavailable") !== false)) {
		$postValue['message'] .= "\n\n <b style='background:red; color: white'>ישנו תוכן נוסף שלא הוצג. \nלעיון יש להכנס להודעה המקורית: </b> \n http://www.facebook.com/" . $postValue['id'] . "\n";
	}

	if (!empty($postValue['object_id']))
	{
		//post has images
	}
	
	$comments = nl2br($comments);
	

	$messageDate = hebDate($postValue['created_time']);
	
	$lastUpdateDate = hebDate($postValue['updated_time']);

	$res = "";

	$res .= 	'<div class="panel radius post">';

	$res .= 		'<h4 style="margin-bottom:2px;">הודעה מאת ' . $postValue['from']['name'] . '</h4>';

	$res .= 		'<p style="color:rgb(97,97,97);">בקבוצת ' . implode(", ", $toList);
	
	if ($messageDate != "")
	{
		$res .= ', בתאריך: ' . $messageDate . '</p>';
	}
	
	$res .= 		'<hr />';
	$res .=  	'<p>' 
				. nl2br($postValue['message']) . '</p>';
	$res .=		'<p id="photos_' . $postValue['id'] . '"></p>';

	if ($comments != "")
	{
		$res .= 	'<h4>תגובות:</h4>';
		$res .= 	'' . $comments . '';
	}
	
	$res .= 	'<h4>פרטים נוספים:</h4>';
	
	$res .= 		'<table class="post_details">';

	if ($lastUpdateDate != "")
	{
		$res .= 			'<tr>';
		$res .= 				'<th>';	
		$res .= 					'עדכון אחרון:';
		$res .= 				'</th>';
		$res .= 				'<td>';	
		$res .= 					$lastUpdateDate;
		$res .= 				'</td>';
		$res .= 			'</tr>';
	}

	$res .= 			'<tr>';
	$res .= 				'<th>';	
	$res .= 					'קישור:';
	$res .= 				'</th>';
	$res .= 				'<td>';	
	$res .= 					'<a href="http://www.facebook.com/' 
							. $postValue['id'] . '" target="_BLANK">פתיחת קישור בחלון חדש</a>';
	$res .= 				'</td>';
	$res .= 			'</tr>';

	$res .= 		'</table>';
	$res .= 	'</div>';

	
	echo $res;
	return $mainGroup;

}

function hebDate($date)
{
	$date = strtotime($date);
	
	$hebDays = array("ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת");
	$ret = "";
	$ret .= "יום " . $hebDays[date("w", $date)] . ", ";
	$ret .= date("d", $date) . "/" . date("m", $date) . "/" . date("Y", $date) . ", ";
	$ret .= "בשעה ";
	$ret .= date("H", $date) . ":" 
		. date("i", $date);

	return $ret;

}

?>
