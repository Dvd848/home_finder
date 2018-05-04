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

include_once("common.inc.php");


$retStatus = array();
$user = new HFUser($facebook);

try  
{  
	
	if (empty($_REQUEST[PARAM_ACTION]))
	{
		throw new Exception( 'Missing action!');
	}
	

	switch ($_REQUEST[PARAM_ACTION])
	{
		// ==================================================================================== //
		case PARAM_VALUE_ACTION__GET_LAST_VISIT:
					
			if (empty($_REQUEST[PARAM_CITY]))
			{
				throw new Exception( 'Missing city!');
			}
			
			if (empty($_REQUEST[PARAM_JSTYPE]))
			{
				throw new Exception( 'Missing JSType!');
			}
			
			$retStatus[PARAM_RETURN_LAST_VISIT] = $user->getLastVisit($_REQUEST[PARAM_CITY], $_REQUEST[PARAM_JSTYPE]);
			
			break;
		
		// ==================================================================================== //		
		
		case PARAM_VALUE_ACTION__UPDATE_LAST_VISIT:
			
			if (empty($_REQUEST[PARAM_LAST_VISIT]))
			{
				throw new Exception( 'Missing field: ' . PARAM_LAST_VISIT . '!');
			}
			
			if (empty($_REQUEST[PARAM_CITY]))
			{
				throw new Exception( 'Missing city!');
			}
			
			if (empty($_REQUEST[PARAM_JSTYPE]))
			{
				throw new Exception( 'Missing JSType!');
			}
					
			$user->setLastVisit($_REQUEST[PARAM_LAST_VISIT], $_REQUEST[PARAM_CITY], $_REQUEST[PARAM_JSTYPE]);

			break;
			
		// ==================================================================================== //		
		
		default: 
			throw new Exception( 'Unknown action: ' . $_REQUEST[PARAM_ACTION] . '!');
			break;
		
		// ==================================================================================== //
	}
	
	$retStatus[PARAM_RETURN_STATUS] = 0;
}  
catch (Exception $e)  
{

	$retStatus[PARAM_RETURN_STATUS] = -1;
	$retStatus[PARAM_RETURN_MESSAGE] = $e->getMessage();
	
} 

echo  json_encode($retStatus);

?>