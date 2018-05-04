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

include_once ("common.inc.php");

if (empty($_GET))
{
	include "index.inc.html";
	exit;
}

$user = new HFUser ( $facebook );

$access_token = $facebook->getAccessToken();



$loadFromServer = false;
$serverPage = SERVER_PAGE_NONE;

if (isset ( $_GET ['_escaped_fragment_'] )) {
	$loadFromServer = true;
	include ("serverSidePrint.inc.php");
	$groupNames = array();
	
	$serverPage = SERVER_PAGE_MESSAGES;
	
	$_GET ['_escaped_fragment_'] = urldecode ( $_GET ['_escaped_fragment_'] );
	parse_str ( $_GET ['_escaped_fragment_'], $escaped_fragment );
	/*
	if (isset ( $escaped_fragment ['city'] )) {
		$_GET ['city'] = $escaped_fragment ['city'];
	}
	
	if (isset ( $escaped_fragment ['type'] )) {
		$_GET ['type'] = $escaped_fragment ['type'];
	}
	*/

	if (isset ( $escaped_fragment ['about'] ) || isset ( $escaped_fragment ['#about'] ) ) {
		$serverPage = SERVER_PAGE_ABOUT;
	}
	
	if (isset ( $escaped_fragment ['privacy'] ) || isset ( $escaped_fragment ['#privacy'] ) ) {
		$serverPage = SERVER_PAGE_PRIVACY;
	}
}

if ($loadFromServer)
{
	$postsPerGroup = 30;
}
else
{
	$postsPerGroup = 100;
}

if (isset ( $_GET ['city'] )) {
	$city = $_GET ['city'];
} else {
	$city = "jerusalem";
}

switch ($city) {
	default :
	case "jerusalem" :
		$cityInclude = "jer";
		$hebCityName = "ירושלים";
		break;
	case "telaviv" :
		$cityInclude = "ta";
		$hebCityName = "תל אביב";
		break;
	case "haifa" :
		$cityInclude = "hf";
		$hebCityName = "חיפה";
		break;
	case "beersheba" :
		$cityInclude = "bs";
		$hebCityName = "באר שבע";
		break;
	case "gd" :
			$cityInclude = "gd";
			$hebCityName = "גוש דן";
			break;
	case "modiin" :
		$cityInclude = "md";
		$hebCityName = "מודיעין";
		break;
}

if (isset ( $_GET ['type'] )) {
	$type = $_GET ['type'];
} else {
	$type = "apartments";
}

switch ($type) {
	default :
	case "apartments" :
		$js_type = "apartments";
		$title = "המדור לחיפוש דירות";
		$subject_plural = "דירות להשכרה";
		break;
	case "stuff" :
		$js_type = "stuff";
		$title = "המדור לחיפוש חפצים";
		$subject_plural = "חפצים ורהיטים למכירה";
		break;
}

include "subjects.inc.php";

$search_placeholder = "סינון הודעות";

$short_title = $title . ": " . $hebCityName;
$long_title = $short_title . " | " . $subject_plural . " ב" . $hebCityName;
$link = AppInfo::getUrl () . '?city=' . $city . '&amp;type=' . $type;
$desc = "הדרך החכמה למצוא " . $subject_plural . " ב" . $hebCityName;
?>
<!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" prefix="fb: http://www.facebook.com/2008/fbml" lang="he" dir="rtl"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js" prefix="fb: http://www.facebook.com/2008/fbml"
	lang="he" dir="rtl">
<!--<![endif]-->
<head>

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />

<title><?php echo he($long_title); ?></title>

<link rel="stylesheet" href="/cache/1/css/foundation.min.css" />
<link rel="stylesheet" href="/cache/<?php echo filemtime("css/home-finder.css")?>/css/home-finder.css" />
<link rel="stylesheet"
	href="/cache/1/fancyBox/source/jquery.fancybox.css" />
<link rel="canonical" href="<?php echo $link; ?>" />
<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />

<!--link href="http://netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet" /-->

<meta property="og:title" content="<?php echo he($short_title); ?>" />
<meta property="og:type" content="website" />
<meta property="og:url" content="<?php echo $link; ?>" />
<meta property="og:image" content="<?php echo AppInfo::getUrl('/images/logo.png'); ?>" />
<meta property="og:site_name" content="<?php echo he($short_title); ?>" />
<meta property="og:description" content="<?php echo he($desc); ?>" />
<meta property="fb:app_id" content="<?php echo AppInfo::appID(); ?>" />

<meta name="fragment" content="!" />

<meta name="description" content="<?php echo he($desc); ?>" />

<script type="text/javascript">
	var js_type = '<?php echo $js_type ?>';
</script>

<script type="text/javascript" src="/cache/1/javascript/jquery-1.7.1.min.js"></script>
<script type="text/javascript" src="/cache/1/fancyBox/source/jquery.fancybox.pack.js"></script>
<script type="text/javascript" 
	src="/cache/<?php echo filemtime("javascript/subjects/".$cityInclude.".js")?>/javascript/subjects/<?php echo $cityInclude?>.js"></script>
<script type="text/javascript" src="/cache/6/javascript/utils.js"></script>
<script type="text/javascript" src="/cache/1/javascript/custom.modernizr.js"></script>
<script type="text/javascript" src="/cache/1/javascript/foundation.min.js"></script>
<script type="text/javascript" src="/cache/1/javascript/waypoints.min.js"></script>
<script type="text/javascript" src="/cache/1/javascript/highlight123.js"></script>

<script type="text/javascript">

if (typeof(JSON) == "undefined")
{
	$.getScript( "/javascript/json2.js");
}

</script>

</head>

<body dir="rtl">
	<div id="fb-root"></div>

	<div class="fixed" id="topBarWrapper">
		<nav class="top-bar" id="topBar">
			<ul class="title-area">
				<!-- Title Area -->
				<li class="name">
					<h1>
						<a href="<?php echo $link; ?>" onclick="return false"><?php echo he($title); ?></a>
					</h1>
				</li>
				<!-- Remove the class "menu-icon" to get rid of menu icon. Take out "Menu" to just have icon alone -->
				<li class="toggle-topbar"><a href="#"><span>תפריט</span></a></li>
			</ul>
	
			<section class="top-bar-section">
				<!-- Right Nav Section -->
				<ul class="right">
	
					<!-- li class="divider hide-for-small"></li -->
					<li class="has-dropdown"><a href="#"><?php echo he($hebCityName); ?></a>
	
						<ul class="dropdown" id="menu_dropdown">
							<li><label>דירות</label></li>
							<li><a href="/?city=jerusalem">דירות להשכרה בירושלים</a></li>
							<li><a href="/?city=telaviv">דירות להשכרה בתל-אביב</a></li>
							<li><a href="/?city=gd">דירות להשכרה בגוש דן (ללא ת"א)</a></li>
							<li><a href="/?city=haifa">דירות להשכרה בחיפה</a></li>
							<li><a href="/?city=beersheba">דירות להשכרה בבאר שבע</a></li>
							<li><a href="/?city=modiin">דירות להשכרה במודיעין</a></li>
							<!--
							<li class="divider"></li>
							<li><label>חפצים ורהיטים</label></li>
							<li><a href="/?city=jerusalem&amp;type=stuff">חפצים ורהיטים למכירה
									בירושלים</a></li>
							<li><a href="/?city=haifa&amp;type=stuff">חפצים ורהיטים למכירה
									בחיפה</a></li>
							<li><a href="/?city=beersheba&amp;type=stuff">חפצים ורהיטים למכירה
									בבאר שבע</a></li>
							-->
						</ul></li>
					<li class="divider"></li>
					<li id="login_wrapper" class="has-form"></li>
					<li class="divider"></li>
					<li class="has-form"><span id="app_details" class="menu_message"></span>
					</li>
					
					
				</ul>
	
				<!-- Left Nav Section -->
				<ul class="left" id="menu_left">
					<li class="divider show-for-small"></li>
	
					<li class="has-form"> 
						<div class="row collapse"> 
							<div class="large-8 small-9 columns"> 
								<input id="searchBox" type="text" placeholder="<?php echo $search_placeholder ?>"> 
							</div> 
							<div class="large-4 small-3 columns"> 
								<a href="#" id="search" class="alert button expand" onclick="return false;">סנן</a>
							</div> 
						</div> 
					</li>
	
					<li class="divider show-for-small"></li>
					<li class="show-for-small has-dropdown"><a href="#">מידע נוסף
							והגדרות מתקדמות</a>
						<ul class="dropdown" id="menu_links">
							<li><label>מידע נוסף</label></li>
							<li><a href="#sub_share" class="menuLink">שיתוף</a></li>
<?php 
if (isset($postToGroup))
{
?>
							<li><a href="#sub_add" class="menuLink">פרסום דירה במדור</a></li>
<?php
} 
?>
							<li><a href="#sub_sort" class="menuLink">מיון</a></li>
							<li><a href="#sub_search" class="menuLink">סינון</a></li>
							<li><a href="#sub_legend" class="menuLink">מקרא</a></li>
							<li class="divider"></li>
							<li><label>הגדרות מתקדמות</label></li>
							<li><a href="#sub_groups" class="menuLink">קבוצות</a></li>
							<li><a href="#sub_map_settings" class="menuLink">הגדרות מפה</a></li>
							<li><a href="#sub_favorites"  class="menuLink">הודעות מועדפות</a></li>
							<li><a href="#sub_dups" class="menuLink">הודעות כפולות</a></li>
							<li><a href="#sub_blocked" class="menuLink">חסימת משתמשים</a></li>
						</ul>
					</li>
	
	
					<li class="divider"></li>
					<li><a href="#!posts" id="postsLink" class="sectionLink">רשימת ההודעות</a></li>
					
					<li class="divider hide-for-small"></li>
					<li class="hide-for-small"><a href="#!feedback" id="feedbackLink" class="sectionLink">שליחת משוב</a></li>
					
					<li class="divider"></li>
					<li><a href="#!about" id="aboutLink" class="sectionLink">אודות</a></li>
	
				</ul>
	
			</section>
		</nav>
	</div>

	<!-- End Nav Bar -->

	<div class="row" style="margin-top: 10px;">
		<div class="large-12 columns">

			<h2 style="color: rgb(0, 68, 85);"><?php echo he($long_title); ?></h2>
			<p><?php echo he($title); ?> סורק קבוצות פופולריות בפייסבוק שעוסקות ב<?php echo he($subject_plural); ?> ומציג רשימה מרוכזת של הודעות רלוונטיות.<br />
				<!-- התחברו עם חשבון הפייסבוק שלכם כדי לצפות בתוכן של קבוצות סגורות ולקבל
				אינדיקציה אודות הודעות חדשות בביקורים הבאים שלכם.-->
			</p>
			<p>
				<!--
				רוצים לדעת מדוע אין אפשרות לבצע סינון המסתיר הודעות שכוללות מילות מפתח מסוימות?
				-->
 				רוצים לקרוא עוד קצת על היכולות של האתר? 
				
				כל זאת ועוד בדף ה"<a href="#!about">אודות</a>" של המדור...
			</p>
			<hr id="contentSeparator" />
		</div>
	</div>

	<div class="row">
		<div class="large-8 columns mainSection" id="postsWrapper">
			<div id="num_posts"></div>
			<div id="num_posts_message"></div>

			<div class="row">

<?php
if (!$loadFromServer) { 
?>
				<div id="loadingPosts">
					<img src='/images/ajax-loader.gif' alt="Loading..." /> &nbsp;
					<span>
					 טוען <?php echo he($subject_plural); ?>...
					</span>
				</div>
<?php 
}
?>
				<div class="large-12 columns" id="posts">
<?php
if ($loadFromServer) {
	if ($serverPage == SERVER_PAGE_MESSAGES)
	{
		$groupNames = printServerPosts ( $facebook, $postsPerGroup, $groupIds );
	}	
} else {
	?>
						
<?php
}
?>
				</div>
			</div>
		</div>
		
		<div class="large-8 columns mainSection" id="mngBlockedWrapper">
			<div class="row">
				<div class="large-12 columns" id="mngBlocked">
					<h3>ניהול חסומים</h3>
					<p>
					רשימת החסומים כוללת משתמשים שההודעות שלהם מוסתרות לחלוטין.
					נכון להיום, חסמתם את המשתמשים ברשימה להלן. במסך זה תוכלו לבחור בשמותיהם ולשחרר אותם
					מחסימה.
					</p>
					<select id="blockedUsersSelect" multiple="multiple"></select>
					<p style="text-align: center;">
						<a href="#" class="small radius button secondary" onclick="unblockUsers(); return false;">ביטול חסימה</a>
					</p>
					
				</div>
				<div class="large-12 columns" style="display: block; text-align: center;">
					<a href="#!posts" class="medium radius button">חזרה לרשימת ההודעות</a>
				</div>
			</div>
		</div>
		
		<div class="large-8 columns mainSection" id="aboutWrapper">
			<div class="row">
				<div class="large-12 columns" id="about">
<?php
if ($loadFromServer) {
	if ($serverPage == SERVER_PAGE_ABOUT)
	{
	
	}
	
} else {
	?>
						
<?php
}
?>
					<h3>אודות</h3>
					<p>
					אז הגיע הזמן לחפש דירה, ונכון שאפשר להשתמש בלוחות המסורתיים, אבל בימינו ממילא כל הדירות
					השוות מתפרסמות בפייסבוק, בין חברים ובקבוצות ייעודיות. איפה הבעיה? הבעיה היא שיש מליון קבוצות
					שונות בכל עיר, שכל תגובה או לייק מקפיצים הודעה שכבר קראתם, שאתם צריכים לקרוא שוב ושוב
					את אותה הודעה בקבוצות שונות, שאי אפשר לחפש ולסנן הודעות ובקיצור - שהפייסבוק הוא פלטפורמה 
					מעולה לשיתוף מידע, אבל בטח לא פלטפורמה שתפורה במיוחד עבור חיפוש דירות.
					</p>
					<p>
					"המדור לחיפוש דירות" מנסה לגשר על הפער הזה, ולהפוך את חווית חיפוש הדירות בפייסבוק לנוחה יותר,
					יעילה יותר, מהירה יותר וחכמה יותר. "המדור" מרכז את ההודעות מכל הקבוצות השונות ברשימה אחת, 
					מסנן כפילויות, ממיין, מסמן הודעות חדשות מול הודעות שנקראו כבר, מדגיש מילות מפתח ומאפשר 
					לצפות במיקומים על גבי מפה.
					<!-- בנוסף, הוא מאפשר להתחבר עם חשבון הפייסבוק, וכך לצפות בתוכן
					של קבוצות סגורות (כמובן שלשם כך תצטרכו להיות חברים בקבוצה כזו), והוא מציג רשימה של כל הקבוצות
					הקיימות כדי שתדעו לאן עוד ניתן להצטרף.-->
					 בנוסף, הוא מאפשר להתחבר עם חשבון הפייסבוק, וכך לסנכרן את ההודעות שקראתם בעבר
					 בין מחשבים שונים, והוא מותאם לחלוטין לסמארטפון, כדי שחלילה לא תפספסו את דירת
					 חלומותיכם גם אם אתם בדרכים.
					</p>
					<p>
					אז מה המדור יודע לעשות?
					</p>
					<ul>
						<li>הוא יודע למשוך את ההודעות מכל הקבוצות השונות העוסקות בדירות להשכרה בעיר מסויימת ולהציג אותן במרוכז.</li>
						<li>הוא יודע למיין את ההודעות לפי תאריך הפרסום (ולא תאריך התגובה האחרונה) כך שהודעות חדשות תמיד יוצגו לפני הודעות ישנות.</li>
						<li>הוא יודע לסמן הודעות שהתווספו מאז הביקור האחרון.</li>
						<li>הוא יודע לזהות כתובות ומיקומים מתוך ההודעות ולהציג אותם על גבי מפה.</li>
						<li>הוא יודע לחשב את מסלול התחבורה הציבורית מכתובות ומיקומים על גבי המפה ליעד נבחר, ויודע להעריך כמה זמן הנסיעה תארך.</li>
						<li>הוא יודע להדגיש ולצבוע מילות מפתח, וכך לאפשר סריקה מהירה של הודעות.</li>
						<li>הוא מאפשר להפעיל סינון על הקבוצות במקרה שהמשתמש לא מעוניין לראות הודעות מקבוצה מסויימת.</li>
						<li>הוא יודע לסנן הודעות כפולות ואף להסתיר אותן לחלוטין.</li>
						<li>הוא מאפשר לבצע חיפוש בהודעות המוצגות.</li>
						<li>הוא מאפשר לסמן מודעות נבחרות על מנת לחזור אליהן מאוחר יותר.</li>
					</ul>
					<!--
					<p>
						מצאתם את דירת חלומותיכם? מעולה! עכשיו צריך לרהט אותה... 
						לצד "המדור לחיפוש דירות" קיים גם "המדור לחיפוש חפצים" שמאפשר למצוא רהיטים 
						וחפצים למסירה ולמכירה. אז למה אתם מחכים? תנו ל"מדור" להוביל אתכם הישר אל הדירה
						שתמיד רציתם!
					</p>
					-->
					
					<h3>שאלות נפוצות</h3>
					<dl>
						<dt>מדוע לא ניתן לבצע סינון המסתיר הודעות בעלות מילים מסוימות?</dt>
						<dd>האתר תומך כיום ב"סינון חיובי" - המאפשר להציג את כל ההודעות שכוללות מילות מפתח מסוימות. הוא לא תומך ב"סינון שלילי", המסתיר את כל ההודעות שכוללות מילות מפתח מסוימות. הסיבה לכך היא שב"סינון שלילי", בניגוד ל"סינון חיובי", הפוטנציאל לפספס הודעה רלוונטית הוא הרבה יותר גבוה. לדוגמא: נניח ואתם מחפשים דירה לזוג, ולכן מעוניינים להסתיר הודעות שכוללות את המילה "שותפים". במקרה כזה, אתם תסתירו על הדרך גם הודעות שמספרות שהדירה "לא מתאימה לשותפים" או הודעות שבהן אחד המגיבים שאל "האם הדירה מתאימה גם לשותפים?". הייתם רוצים לפספס את דירת חלומותיכם רק בגלל חיפוש לא נכון?<br/>
						למרות שהאתר לא תומך ב"סינון שלילי" אוטומטי, הוא מנסה לסייע בפסילת הודעות שאינן רלוונטיות במהירות. למשל, המילה "שותפים" ונטיותיה הנפוצות מודגשות באדום, כך שניתן במהירות לאתר את המיקום שלהן בהודעה ולהבין האם מדובר בדירה רלוונטית או שכדאי לעבור להודעה הבאה.
						</dd>
						
						<dt>מדוע לא ניתן לבצע סינון על פי פרמטרים (חדר, מחיר וכד')?</dt>
						<dd>האתר אוסף מודעות בטקסט חופשי מהפייסבוק, בניגוד לאתרי לוחות מסורתיים שבהם המשתמשים ממלאים שדות מוגדרים מראש בנוגע למחיר, שטח, מספר החדרים וכו'.
						לכן, לא תמיד קל למערכת ממוחשבת להסיק מתוך הטקסט החופשי את הפרטים הללו ולייצג אותם בצורת טבלה או לאפשר לסנן על פיהם. 
						אין מדובר במשימה בלתי אפשרית, אך היא מצריכה משאבים רבים יותר ממה שאתר בסדר גודל כזה יכול להקצות. מכיוון שהצגת המידע בצורת טבלה או סינון על פי פרמטרים עשויים לגרור טעויות רבות, הוחלט שלא להציע אפשרות זו.
						</dd>
						
						<dt>מדוע הודעות מקבוצות סגורות אינן מוצגות?</dt>
						<dd>
						בעבר, היה ניתן לצפות בהודעות מקבוצות סגורות בתנאי שהייתם חברים באותה קבוצה. אולם, למרבה הצער, פייסבוק שינו
						את מנגנון ההרשאות וכעת הם אינם מאפשרים לאפליקציות חיצוניות לגשת להודעות של קבוצות סגורות.
						לכן, המדור לא יכול להציג הודעות אלו ברשימת ההודעות. 
						</dd>
						
						<dt>כיצד ניתן להוסיף הודעות לאתר?</dt>
						<dd>על מנת לפרסם הודעה באתר, יש לפרסם אותה באחת מקבוצות הפייסבוק הרלוונטיות. לאחר מכן, ההודעה תוצג אוטומטית גם באתר.
						</dd>
						
						<dt>מהי מדיניות הפרטיות של האתר?</dt>
						<dd>ניתן למצוא את מדיניות הפרטיות של האתר <a href="#!privacy">כאן</a>.
						</dd>
						
						
					</dl>
				</div>
				<div class="large-12 columns" style="display: block; text-align: center;">
					<a href="#!posts" class="medium radius button">חזרה לרשימת ההודעות</a>
				</div>
			</div>
		</div>

		<div class="large-8 columns mainSection" id="privacyWrapper">
			<div class="row">
				<div class="large-12 columns" id="privacy">
<?php
if ($loadFromServer) {
	if ($serverPage == SERVER_PAGE_PRIVACY)
	{
	
	}
	
} else {
	?>
						
<?php
}
?>
					<h3>מדיניות הפרטיות</h3>
					<p>
					מדיניות הפרטיות הזו נועדה לבאר כיצד אתר זה משתמש במידע אודות גולשי האתר. אנא קראו את מדיניות הפרטיות 
					שלנו בעיון על מנת להבין כיצד אנו אוספים מידע פרטי, משתמשים בו ומגנים עליו במהלך ואחרי הגלישה באתר.
					</p>
					<h4>מידע פרטי</h4>
					<p>
					לאחר התחברות לאתר עם חשבון הפייסבוק, האתר שומר במסד הנתונים שלו את מזהה הפייסבוק שלכם, את תאריך
					הביקור האחרון שלכם ואת הדף שבו  צפיתם. זאת, על מנת לסמן עבורכם הודעות שנקראו בעבר בביקורכם הבא.
					המידע הנשמר כולל אך ורק את תאריך ביקורכם האחרון, ולא את היסטוריית הביקורים שלכם. מידע זה נשמר בכל פעם
					שאתם מבקרים באתר כאשר הנכם מחוברים לחשבון הפייסבוק שלכם.
					</p>

					<h4>עוגיות</h4>
					<p>
					אתר זה משתמש גם בעוגיות על מנת לשמור את תאריך הביקור האחרון שלכם ואת הדף שבו  צפיתם. זאת, על מנת
					לאפשר למשתמשים שבחרו שלא להתחבר עם חשבון הפייסבוק שלהם להבדיל בין הודעות חדשות להודעות שנצפו בעבר.
					ניתן להשתמש בשירותי האתר גם בלי לאפשר עוגיות, אך במקרה כזה כל ההודעות תמיד יסומנו כהודעות חדשות.
					</p>

					<h4>מסירת מידע לצד שלישי</h4>
					<p>
					ככלל, המידע הנצבר באתר אינו נמסר לגורמים חיצוניים. עם זאת, האתר שומר את הזכות למסור מידע לגורמים חיצוניים
					במידה וידרש לעשות כן על פי חוק, או במקרה של ניסיון לחבל בשירותי האתר או בזמינותו. יש לציין כי האתר משתמש 
					בשירותים חיצוניים כגון Facebook ו-Google Analytics, ואלו עשויים לשמור מידע פרטי בהתאם למדיניות הפרטיות שלהם.
					</p>

					<p>
					תאריך עדכון אחרון: 6.6.2015.
					</p>

				</div>
				<div class="large-12 columns" style="display: block; text-align: center;">
					<a href="#!posts" class="medium radius button">חזרה לרשימת ההודעות</a>
				</div>
			</div>
		</div>
		
		<div class="large-8 columns mainSection" id="feedbackWrapper">
			<div class="row">
				<div class="large-12 columns" id="feedback">
					<h3>משוב</h3>
					<p>
					יש לכם הצעה? מצאתם באג? רוצים להוסיף קבוצה? נשמח לשמוע את המשוב שלכם!
					</p>
					<!-- Iframe will come here -->
				</div>
				<div class="large-12 columns" style="display: block; text-align: center;">
					<a href="#!posts" class="medium radius button">חזרה לרשימת ההודעות</a>
				</div>
			</div>
		</div>

		<div class="large-4 columns" id="sideBar">
			<h3 class="show-for-small"
				style="text-align: center; margin: 20px auto;" id="more_info">מידע
				נוסף והגדרות מתקדמות</h3>


			<div>
				<h4 id="sub_share">שיתוף</h4>
				<div>
					<a href="#" class="medium radius button"
						onclick="window.open('https://www.facebook.com/sharer/sharer.php?u='
				  		   	+encodeURIComponent(location.href), 'facebook-share-dialog', 
							'width=626,height=436'); return false;">נעזרתם במדור? שתפו אותו!</a>
				</div>

				<div>
					<div class="fb-like-box" data-href="http://www.facebook.com/dirot2"
						data-width="215" data-height="30" data-colorscheme="light"
						data-show-faces="false" data-header="true" data-stream="false"
						data-show-border="true"></div>
					<p style="font-weight: bold;">אהבתם את הרעיון? עשו לנו Like!</p>
				</div>
				
				
			</div>
<?php 
if (isset($postToGroup))
{
?>
			<h4 id="sub_add">פרסום דירה במדור</h4>
			<div>
					<a href="#add_apartment" id="add_apartment_link" class="medium radius button">פרסמו דירה חדשה במדור!</a>
			</div>
<?php
} 
?>
				
			<div>
				<h4 id="sub_groups">קבוצות</h4>
				<p>
					"<?php echo he($short_title); ?>" מציג כרגע הודעות מתוך הקבוצות הבאות:
					</p>
				<div id="groupList">
<?php
if ($loadFromServer) {
	if (is_array ( $groupNames )) {
		echo "<ul>";
		foreach ( $groupNames as $groupId => $groupName ) 
		{
			if (trim($groupName) != "")
			{
				echo "<li><a href='https://www.facebook.com/" . $groupId . "' target='_BLANK'>" . $groupName . "</a></li>";
			}
		}
		echo "</ul>";
	}
} else {
	?>
						<div style="text-align: center;">
						<img src='/images/ajax-loader.gif' alt="Loading..." />
					</div>
<?php
}
?>
					</div>
				<p>
				<!-- 
					חסרה לכם קבוצה? נסו להתחבר לאתר עם חשבון הפייסבוק - קבוצות סגורות
					מוצגות רק כשאתם מחוברים לאתר (וחברים בקבוצה). עדיין חסרה? -->
					חסרה לכם קבוצה (פתוחה)? 
					<a
						href="https://docs.google.com/forms/d/1SBj7Lb4Y8JtkDx0ef-uWYBvNAfTC784QFXzvz-DYLQk/viewform"
						target="_BLANK">הציעו לנו אותה</a>!
				</p>
				<p id="showAllGroupsWrapper">&nbsp;</p>

			</div>

			<div>
				<h4 id="sub_map_settings">הגדרות מפה</h4>
				<p>
					כאשר המדור מזהה כתובת כלשהי בתוך אחת ההודעות, הוא מסמן אותה בצבע
					כתום ומציג לידה סמל של אוטובוס (<img src="/images/bus.jpg"
						alt="Bus" />).
				</p>
				<p>לחיצה על האוטובוס תציג הערכה של המסלול והזמן הנדרשים על מנת להגיע
					ממיקום זה ל"יעד התחבורה הציבורית" שנקבע.</p>
				<p>
					<a href="#transportation"
						class="medium radius button transportLink">שינוי יעד התחבורה
						הציבורית</a>
				</p>
			</div>
			
			<div class="menuSectionWithCB">
				<h4 id="sub_favorites">הודעות מועדפות</h4>
				<p>ניתן לסמן הודעות מבטיחות בתור הודעות מועדפות על ידי לחיצה על סמל הכוכב, ולחזור אליהן מאוחר יותר.</p>
				<p>באמצעות ההגדרה הבאה תוכלו לבחור האם להציג את כל ההודעות או רק הודעות מועדפות:</p>
				
				<div style="clear: both; margin-right: 0.8em;">
					<input type="checkbox" value="showFavorites" id="showFavorites_cb" name="showFavorites_cb" style="top: 2px;"/>
					<label for="showFavorites_cb">הצג רק הודעות מועדפות</label>
				</div>
				<div style="clear: both;"></div>
			</div>
			
			<div class="menuSectionWithCB">
				<h4 id="sub_dups">הודעות כפולות</h4>
				<p>הודעות כפולות של אותו משתמש בקבוצות שונות מוצגות בתצוגה ממוזערת, והתגובות להודעות
				הכפולות מוצגות גם בהודעה המקורית. </p>
				<p>
				באפשרותכם להסתיר הודעות כפולות לחלוטין במקום להציגן בתצוגה ממוזערת.
				</p>
				<div style="clear: both; margin-right: 0.8em;">
					<input type="checkbox" value="hideDups" id="hideDupd_cb" name="hideDupd_cb" style="top: 2px;"/>
					<label for="hideDupd_cb">הסתר הודעות כפולות לחלוטין</label>
				</div>
				<div style="clear: both;"></div>
			</div>

			<div>
				<h4 id="sub_sort">מיון</h4>
				<p>ההודעות ממוינות לפי תאריך הפרסום המקורי ולא לפי תאריך התגובה
					האחרונה. כך, ניתן לעבור על הודעות חדשות ברצף מבלי להתקל בהודעות
					ישנות שהוקפצו לראש הדף רק משום שהתווספה להן תגובה חדשה.</p>
			</div>
			
			<div>
				<h4 id="sub_search">סינון</h4>
				<p>תיבת הסינון בתפריט העליון מאפשרת לכם להציג רק את ההודעות
				שמכילות את מילות המפתח שבחרתם. הכניסו רשימת מילות מפתח, מופרדת ברווחים,
				על מנת לצפות בהודעות שמכילות את כל מילות המפתח. לחיפוש ביטוי מדויק, הקיפו אותו בגרשיים. למשל, על מנת
				לחפש הודעות שמציינות את הביטוי "2 חדרים" יחד עם המילה "זוג", הקלידו: "2 חדרים" זוג.</p>
				<p>ואף על פי כן, זכרו: מדובר בחיפוש בטקסט חופשי, וישנם מגוון דרכים לנסח כל פרט בהודעה.</p>
			</div>
			
			<div>
				<h4 id="sub_blocked">חסימה</h4>
				<p>נמאס לכם לקרוא הודעות ספאם שבוע אחרי שבוע? חסמו את בעל ההודעה, וההודעות הנוכחיות והעתידיות שלו יוסתרו מיד.</p>
				<p>חסמתם מישהו בטעות? תוכלו לבטל את החסימה דרך <a href="#!mngBlocked">מסך ניהול החסומים</a>.</p>
			</div>

			<div class="hide-for-small">
				<h4>ניווט מהיר</h4>
				<p>תוכלו להעזר בקיצורים הבאים על מנת לנווט בין ההודעות:</p>
				<ul class="disc">
					<li>J - מעבר להודעה הבאה</li>
					<li>K - חזרה להודעה הקודמת</li>
				</ul>
			</div>

			<div>
				<h4 id="sub_legend">מקרא</h4>

				<p>למדו מה אומר כל צבע ואייקון כדי לסרוק הודעות במהירות.</p>

				<h6>צבעים:</h6>
				<ul class="disc">
					<li><span style="font-weight: bold; color: orange">כתום</span>:
						מיקום מזוהה על גבי המפה</li>
					<li><span style="font-weight: bold; color: BurlyWood">חום</span>:
						רחוב</li>
					<li><span style="font-weight: bold; color: purple">סגול</span>:
						<?php echo ("gd" == $city) ? "עיר" : "שכונה" ?></li>
					<li><span style="font-weight: bold; color: green">ירוק</span>: מחיר</li>
					<li><span style="font-weight: bold; color: blue">כחול</span>: תאריך
						כניסה</li>
					<li><span style="font-weight: bold; color: DodgerBlue">תכלת</span>:
						רהיט / חפץ</li>
					<li><span style="font-weight: bold; color: red">אדום</span>: שותפים</li>
					<li><span style="font-weight: bold; color: Tomato">אדמדם</span>: סאבלט</li>
					<li><span style="font-weight: bold; color: Magenta">ורוד</span>:
						זוג</li>
					<li><span style="font-weight: bold; color: Olive">זית</span>: דת</li>
				</ul>
				<h6>אייקונים:</h6>
				<ul class="disc" id="icon_legend">
					<li><img src="/images/mail.png" alt="שליחת הודעה פרטית" width="28" /> - 
						 שליחת הודעה פרטית
					</li>
					<li><img src="/images/bus.jpg" alt="מסלול תחבורה ציבורית" width="20" /> - 
						 הצגת מסלול תחבורה ציבורית
					</li>
				</ul>

			</div>

			<div class="hide-for-small">
				<h4 id="sub_qr">קישור מהיר</h4>

				<p>אל תפספסו את הדירה רק כי אתם ניידים!</p>

				<div style="width: 85%; text-align: center; margin: 10px 0;">
					<img
						src="/images/qr/<?php echo $cityInclude . '_' . $js_type; ?>.png"
						alt="קישור מהיר - <?php echo he($long_title); ?>" width="180" />
				</div>

				<p>
					"<?php echo he($title); ?>" מלווה אתכם עם אתר מותאם, גם בסמארטפון.
					
					</p>

			</div>

			<div class="show-for-small"
				style="text-align: center; padding: 20px;">
				<a href="#top" id="backToTop">חזרה לראש הדף</a>
			</div>



		</div>
	</div>

	<!-- ####################################### -->
	
	<div id="login_now" style="display: none;">
		<h2>התחברות לאתר</h2>
		<p>
			"<?php echo he($title); ?>"
			 עושה מאמץ להציג כמה שיותר מידע בצורה חופשית, ללא צורך בהתחברות לאתר
			 עם חשבון הפייסבוק. אולם, במקרים מסויימים, ניתן לצפות בתוכן מסויים
			 אך ורק על ידי התחברות לאתר, וזאת עקב הרשאות פרטיות מחמירות
			 של משתמשים שונים או של אפשרויות מתקדמות.
		</p>
		<p>
			באמצעות התחברות לחשבון הפייסבוק שלכם, תוכלו 
			<!-- לצפות בתוכן של קבוצות סגורות שאתם חברים בהן, או --> 
			לראות תמונות שפורסמו כתגובה להודעה.
			כמו כן, תוכלו לראות הודעות של משתמשים שבחרו להגביל את מידת הנראות
			של הודעותיהם למשתמשים מחוברים בלבד.
		</p>
		<p>
			 בנוסף, באמצעות התחברות לאתר עם חשבון הפייסבוק, "המדור"
			 יזכור אילו הודעות ראיתם כבר ויציג אינדיקציה אודות הודעות חדשות
			 ללא קשר למחשב ממנו אתם גולשים באתר.
		</p>
		<p style="font-size: 1.2em; text-align: center; font-weight: bold;">
			<a href="#" onclick="FB_Login(); $.fancybox.close(); return false;">לחצו כאן</a>
			על מנת להתחבר לאתר עם חשבון הפייסבוק שלכם.
		</p>
	</div>


	<div id="transportation" style="display: none">
		<h2>שינוי יעד תחבורה ציבורית</h2>
		<p>
			כאשר המדור מזהה כתובת כלשהי בתוך אחת ההודעות, הוא מסמן אותה בצבע כתום
			ומציג לידה סמל של אוטובוס (<img src="/images/bus.jpg" width="15"
				alt="bus" />). לחיצה על המיקום תציג אותו על מפה, בעוד שלחיצה על
			האוטובוס תציג הערכה של המסלול והזמן הנדרשים על מנת להגיע ממיקום זה
			ל"יעד התחבורה הציבורית" שנקבע.
		</p>

		<form action="#" method="get"
			onsubmit="change_transportation(); return false;">
			"יעד התחבורה הציבורית" הנוכחי הוא:
			<div style="text-align: center;">
				<input type="text" id="transportation_dest"
					style="margin: 10px auto" /> <a href="#" id="change_transportation"
					class="small radius button" onclick="return false;">שינוי היעד</a>
			</div>
		</form>

		<p id="transportation_message">&nbsp;</p>
	</div>

	<div id="allGroups" style="display: none;">
		<!-- h2>רשימת הקבוצות המלאה</h2>
		<p>זוהי רשימה מלאה של כל הקבוצות, כולל קבוצות סגורות שאינכם רשומים
			אליהן. רוצים לראות הודעות נוספות? הצטרפו לקבוצות הללו ותוכלו לצפות
			בתוכן שלהן כשאתם מחוברים למדור עם חשבון הפייסבוק שלכם.</p-->
		<h2>רשימת הקבוצות הסגורות</h2>
		<p>זוהי רשימה של קבוצות סגורות. למרבה הצער, פייסבוק מונעים הצגה של הודעות מקבוצות אלו. הקפידו לבדוק אותן עצמאית!</p>
		<div style="text-align: center; padding: 0 30px;"
			id="allGroupsContent">
			<img src='/images/ajax-loader.gif' alt="טוען..."
				style="margin: 20px;" />
		</div>
	</div>
	
	<div id="blockUserDialog" style="display: none;">
		<h2>חסימת משתמשים</h2>
		
	</div>
	
<?php 
if (isset($postToGroup))
{
?>
	<div id="add_apartment" style="display: none;">
		<h2>הוספת דירה למדור</h2>
		<p>
		המדור מושך הודעות מקבוצות פייסבוק פופולריות, ולכן, כדי להוסיף הודעה שתוצג במדור, צריך בסך הכל לפרסם הודעה באחת מקבוצות הפייסבוק הכלולות במדור.
		</p>
		<p>
		לחשיפה מירבית, מומלץ לפרסם הודעה בקבוצה פתוחה. לחצו על הכפתור הבא לפרסום בקבוצה פתוחה:
		</p>
		<p style="text-align: center;">
			<a href="https://www.facebook.com/groups/<?php echo $postToGroup;?>" class="medium radius button" target="_BLANK">פרסמו דירה חדשה במדור!</a>
		</p>
	</div>
<?php
} 
?>

<?php
if (! $loadFromServer) {
	?>

<script type="text/javascript">
var accessToken = "<?php echo $access_token;?>";

var cookieSuffix = "<?php echo $cityInclude . '_' . $js_type; ?>";

var search_placeholder = "<?php echo $search_placeholder ?>";

var groupIds = <?php echo json_encode($groupIds);?>;

var postsPerGroup = <?php echo $postsPerGroup ?>;

var userLastTimeStamp = <?php try { echo $user->getLastVisit($city, $js_type); } catch (Exception $e) { echo "null"; }  ?>; 

var fb_appId = '<?php echo AppInfo::appID(); ?>';

var fb_channelUrl = '//<?php echo $_SERVER["HTTP_HOST"]; ?>/channel.html';
<?php
	if (DEBUG_MODE) 
	{
		if ($_SERVER ["HTTP_HOST"] == "10.0.0.2:5000") 
		{
?>
			var debugStart = function(){start();};
<?php
		}
	}
?>

var create_server_lastvisit_data = function(timestamp)
{
	return {
		<?php echo PARAM_ACTION ?>: "<?php echo PARAM_VALUE_ACTION__UPDATE_LAST_VISIT ?>", 
		<?php echo PARAM_LAST_VISIT ?>: timestamp,
		<?php echo PARAM_CITY ?>: "<?php echo $city ?>",
		<?php echo PARAM_JSTYPE ?>: "<?php echo $js_type ?>"
	};
};
</script>
<script type="text/javascript" src="/cache/<?php echo filemtime("javascript/logic.js")?>/javascript/logic.js"></script>

<?php
} // end (!loadFromServer)
?>



<?php
if (! DEBUG_MODE) {
	?>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-44383757-1', 'dirot2.com');
  ga('send', 'pageview');

</script>
<?php
}
?>
	<a style="position: fixed; bottom: 5px; left: 5px;" href="#top"
		title="חזרה לראש הדף"><img style="border: none;"
		src="/images/back_to_top_btn.png" alt="חזרה לראש הדף" /></a>

</body>
</html>
