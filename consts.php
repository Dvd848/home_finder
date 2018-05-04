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

if (getenv("HOME_FINDER_DBG") == 1)
{
	DEFINE("DEBUG_MODE", true); 
}
else
{
	DEFINE("DEBUG_MODE", false); 
}


//Query names
DEFINE("QUERY_UPDATE_LAST_VISIT", "Query_UpdateLastVisit"); 
DEFINE("QUERY_GET_LAST_VISIT", "Query_GetLastVisit"); 



//Parameter names
DEFINE("PARAM_ACTION", "action");
DEFINE("PARAM_LAST_VISIT", "lastVisitMilli");
DEFINE("PARAM_CITY", "city");
DEFINE("PARAM_JSTYPE", "jstype");

DEFINE("PARAM_RETURN_STATUS", "status");
DEFINE("PARAM_RETURN_MESSAGE", "status");
DEFINE("PARAM_RETURN_LAST_VISIT", PARAM_LAST_VISIT);

//Parameter values
DEFINE("PARAM_VALUE_ACTION__UPDATE_LAST_VISIT", "updateLastVisit");
DEFINE("PARAM_VALUE_ACTION__GET_LAST_VISIT", "getLastVisit");


//Cities
DEFINE("CITY_KEY_JERUSALEM", "jerusalem");
DEFINE("CITY_KEY_TELAVIV", "telaviv");
DEFINE("CITY_KEY_HAIFA", "haifa");
DEFINE("CITY_KEY_BEERSEBA", "beersheba");
DEFINE("CITY_KEY_GD", "gd");
DEFINE("CITY_KEY_MODIIN", "modiin");

//Types
DEFINE("JSTYPE_APARTMENTS", "apartments");
DEFINE("JSTYPE_STUFF", "stuff");

define ("CITY_KEY_IDS", serialize (array(CITY_KEY_JERUSALEM, CITY_KEY_TELAVIV, CITY_KEY_HAIFA, CITY_KEY_BEERSEBA, CITY_KEY_GD)));
define ("JS_TYPES", serialize (array(JSTYPE_APARTMENTS, JSTYPE_STUFF)));

//Server Pages
DEFINE("SERVER_PAGE_NONE", 0);
DEFINE("SERVER_PAGE_MESSAGES", 1);
DEFINE("SERVER_PAGE_ABOUT", 2);
DEFINE("SERVER_PAGE_PRIVACY", 3);

//DB credentials
 
if (getenv("HOME_FINDER_DBG") == 1)
{
	DEFINE("DB_CONNECT_STR", "host=127.0.0.1 port=5432 dbname=dirot2db user=my_user password=my_password options='--client_encoding=UTF8'");
	DEFINE("AB_PATH", "/home/user/workspace/home-finder/");
}
else
{
	DEFINE("DB_CONNECT_STR", "");
	DEFINE("AB_PATH", "/app/www/");
}

?>
