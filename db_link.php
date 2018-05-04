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

class db_link {
	private $link;
	private $isDebugMode;
	
	public function __construct () 
	{
		$this->isDebugMode = DEBUG_MODE;
		if ($this->isDebugMode)
		{
			$this->link = pg_connect(DB_CONNECT_STR);
		}
		else
		{
			$this->link = @pg_connect(DB_CONNECT_STR);
		}
		
		if (!$this->link)
		{
			$this->echoDebugInfo();
		}
		
	}
	
	function echoDebugInfo()
	{
		if ($this->isDebugMode)
		{
			die(pg_last_error($this->link));
		}
	}
	
	function prepare($stmtname , $query)
	{
		if ($this->link)
		{
			$result = pg_prepare($this->link, $stmtname, $query);
			
			if (!$result)
			{
				$this->echoDebugInfo();
			}
			
			return $result;
		}
		
		return null;
	}
	
	function execute($stmtname, $params)
	{
		if ($this->link)
		{
			$result = pg_execute($this->link, $stmtname, $params);
			
			if (!$result)
			{
				$this->echoDebugInfo();
			}
			
			return $result;
		}
		
		return null;
	}
	
	function query ($sql_query) 
	{
		if ($this->link)
		{
			$result = pg_query($this->link, $sql_query);
			
			if (!$result)
			{
				$this->echoDebugInfo();
			}

			return $result;
		}
		
		return null;
	}
	
	function make_safe($x)
	{
		if ($this->link)
		{
			if (is_numeric($x))
			{
				//number
				if ((string)(float)$x === (string)$x)
				//$x is numeric and decimel
				{
					return $x;
				}
				else
				{
					return (float)$x;
				}
			}
			else
			{
				//string
				if (get_magic_quotes_gpc())
				{
					$x = stripslashes($x);
				}
				return "'".pg_escape_string($this->link, $x)."'";
			}
		}
		
		return null;
	}
	
	function fetch_assoc($result)
	{
		if ($this->link)
		{
			$row = pg_fetch_assoc($result);
			return $row;
		}
		
		return null;
	}
	
	function num_rows($result)
	{
		if ($this->link)
		{
			$rows = pg_num_rows($result);
			return $rows;
		}
		
		return null;
	}
	
	function affected_rows($result)
	{
		if ($this->link)
		{
			$rows = pg_affected_rows($result);
			return $rows;
		}
		
		return null;
	}

	function __destruct() 
	{
		if ($this->link)
		{
			pg_close ($this->link);
		}
	}
}

?>
