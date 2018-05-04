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

$whitelist = array(
	'javascript/jquery-1.7.1.min.js'=>'javascript',
	'fancyBox/source/jquery.fancybox.pack.js'=>'javascript',
	'javascript/subjects/jer.js'=>'javascript',
	'javascript/subjects/ta.js'=>'javascript',
	'javascript/subjects/bs.js'=>'javascript',
	'javascript/subjects/hf.js'=>'javascript',
	'javascript/utils.js'=>'javascript',
	'javascript/custom.modernizr.js'=>'javascript',
	'javascript/foundation.min.js'=>'javascript',
	'javascript/waypoints.min.js'=>'javascript',
	'javascript/json2.js'=>'javascript',
		
	'css/foundation.min.css'=>'css',
	'css/home-finder.css'=>'css',
	'fancyBox/source/jquery.fancybox.css'=>'css'
	);

if (isset($_GET['file']))
{
    if (array_key_exists($_GET['file'], $whitelist))
    {
        require_once("common.inc.php");
       
        $file = $_GET['file'];
        $file_mtime = filemtime($file);
       
        ob_start ("ob_gzhandler");
        $header = "Content-type: text/".$whitelist[$file]."; charset: UTF-8";
        header($header);

        header("Cache-Control: must-revalidate, public");
        $offset = 60 * 60 * 24 * 7 * 4 * 11;
        $ExpStr = "Expires: " .
        gmdate("D, d M Y H:i:s",
        time() + $offset) . " GMT";
        header($ExpStr);
        header("Vary: Accept-Encoding");
       
        header("Last-Modified: " . gmdate("D, d M Y H:i:s", $file_mtime) . " GMT");
   
        readfile(AB_PATH.'/'.$file);
    }
}

?>
