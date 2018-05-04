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

if (getenv('HOME_FINDER_DBG'))
{
	$onLocalhost = true;
	session_set_cookie_params (0, "/", ".local.dirot2.com"); 
}
else
{
	$onLocalhost = false;
	session_set_cookie_params (0, "/", ".dirot2.com"); 
}

session_start();

// Provides access to app specific values such as your app id and app secret.
// Defined in 'AppInfo.php'
require_once('AppInfo.php');

// Enforce https on production
if ( (substr(AppInfo::getUrl(), 0, 8) != 'https://') && /*($_SERVER['REMOTE_ADDR'] != '127.0.0.1') &&*/ (!$onLocalhost) ) {
  //header('Location: https://'. $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
  //exit();
}

// This provides access to helper functions defined in 'utils.php'
require_once('utils.php');


/*****************************************************************************
 *
 * The content below provides examples of how to fetch Facebook data using the
 * Graph API and FQL.  It uses the helper functions defined in 'utils.php' to
 * do so.  You should change this section so that it prepares all of the
 * information that you want to display to the user.
 *
 ****************************************************************************/

//require_once('sdk/src/facebook.php');
require_once 'vendor/autoload.php';

$facebook = new Facebook(array(
  'appId'  => AppInfo::appID(),
  'secret' => AppInfo::appSecret(),
  'sharedSession' => true,
  'trustForwarded' => true,
  //'cookie' => true,
));

include_once("user.inc.php");

/*
$user_id = $facebook->getUser();
if ($user_id) {
	try {
		// Fetch the viewer's basic information
		//$basic = $facebook->api('/me');
		$fb_basic_info = $facebook->api('/'.$facebook->getUser().'?access_token='.$facebook->getAccessToken());
	} catch (FacebookApiException $e) {
		// If the call fails we check if we still have a user. The user will be
		// cleared if the error is because of an invalid accesstoken
		if (!$facebook->getUser()) {
			//$result = $e->getResult();
			//var_dump($result);
		}
	}
}
*/



?>
