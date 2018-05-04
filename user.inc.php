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

require_once("utils.php");
require_once("consts.php");

class HFUser {
	private $userId;
	private $basic_info;
	private $isLoggedIn;
	
	public function __construct ($facebook) 
	{
		$this->user_id = $facebook->getUser();
		if ($this->user_id) {
			try {
				// Fetch the viewer's basic information
				//$basic = $facebook->api('/me');
				$this->basic_info = $facebook->api('/'.$this->user_id.'?access_token='.$facebook->getAccessToken());
				$this->isLoggedIn = true;
			} catch (FacebookApiException $e) {
				// If the call fails we check if we still have a user. The user will be
				// cleared if the error is because of an invalid accesstoken
				if (!$facebook->getUser()) {
					$result = $e->getResult();
					//var_dump($result);
					$this->isLoggedIn = false;
				}
			}
		}
	}
	
	function isLoggedIn()
	{
		return $this->isLoggedIn;
	}
	
	
	private function getBasicData($field)
	{
		if (!$this->isLoggedIn)
		{
			throw new Exception( 'User not logged in!');
		}
		
		if ( !array_key_exists($field, $this->basic_info) )
		{
			throw new Exception( 'Missing field: ' . $field . '!');
		}
		
		return $this->basic_info[$field];
	}
	
	function getId()
	{
		return $this->getBasicData("id");
	}
	
	
	function getLastVisit($city, $jstype)
	{
		if (!$this->isLoggedIn)
		{
			throw new Exception( 'User not logged in!');
		}
		
		$city_id= get_array_index(unserialize(CITY_KEY_IDS), $city);
		if ( (empty($city)) || ($city_id < 0) )
		{
			throw new Exception( 'Invalid argument: City!');
		}
		
		$jstype_id = get_array_index(unserialize(JS_TYPES), $jstype);
		if ( (empty($jstype)) || ($jstype_id < 0) )
		{
			throw new Exception( 'Invalid argument: JSType!');
		}
		
		
		$db = new db_link();
		if (!$db)
		{
			throw new Exception( 'DB Error 1!');
		}
		
		if (!$db->prepare(QUERY_GET_LAST_VISIT, "SELECT last_visit FROM lastvisit2 WHERE user_id = $1 AND city = $2 AND jstype = $3"))
		{
			throw new Exception( 'DB Error 2!');
		}

		
		$lastvisit_result = $db->execute(QUERY_GET_LAST_VISIT, array($this->getId(), $city_id, $jstype_id));
		if (!$lastvisit_result)
		{
			throw new Exception( 'DB Error 3!');
		}
		
		
		if ($db->num_rows($lastvisit_result) != 1)
		{
			throw new Exception( 'DB Error 4!');
		}

		if ($lastvisit_row = $db->fetch_assoc($lastvisit_result)) 
		{
			return $lastvisit_row['last_visit'];
		}
		else
		{
			throw new Exception( 'DB Error 5!');
		}

	}
	
	function setLastVisit($lastVisit, $city, $jstype)
	{
		if (!$this->isLoggedIn)
		{
			throw new Exception( 'User not logged in!');
		}
		
		if ( (!is_numeric($lastVisit)) || ($lastVisit <= 0) )
		{
			throw new Exception( 'Invalid argument: LastVisit!');
		}
		
		$city_id= get_array_index(unserialize(CITY_KEY_IDS), $city);
		if ( (empty($city)) || ($city_id < 0) )
		{
			throw new Exception( 'Invalid argument: City!');
		}
		
		$jstype_id = get_array_index(unserialize(JS_TYPES), $jstype);
		if ( (empty($jstype)) || ($jstype_id < 0) )
		{
			throw new Exception( 'Invalid argument: JSType!');
		}
		
		$db = new db_link();
		if (!$db)
		{
			throw new Exception( 'DB Error 1!');
		}

		if (!$db->prepare(QUERY_UPDATE_LAST_VISIT, "SELECT updateLastVisit2($1, $2, $3, $4)"))
		{
			throw new Exception( 'DB Error 2!');
		}

		$lastvisit_result = $db->execute(QUERY_UPDATE_LAST_VISIT, array($this->getId(),
																		$city_id,
																		$jstype_id,
																		$lastVisit));
		if (!$lastvisit_result)
		{
			throw new Exception( 'DB Error 3!');
		}
	}
	
	
	

	function __destruct() 
	{
		
	}
}

?>
