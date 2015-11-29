<?
//Gaetan Langhade - gl@interfacteur.com

header("Content-Type: application/json");
header("Cache-Control: no-cache");

//http://stackoverflow.com/a/33700543
//http://stackoverflow.com/questions/4545790/file-get-contents-returns-403-forbidden/33700543#33700543
//http://stackoverflow.com/questions/4545790/file-get-contents-returns-403-forbidden
$context = stream_context_create(array("http" => array("header" => "User-Agent: Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36")));

$url0 = explode("?query=", "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]");
$url = urlencode($url0[1]);
echo file_get_contents("https://api.github.com/search/repositories?q=".$url, false, $context);

?>