/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */



/*
	settings to be contributed

	see also .htaccess */




var root_level = 3,
/*
	http://www.domain.tld/index.html : 0
	http://www.domain.tld/level1/index.html : 1
	http://www.domain.tld/level1/level2/index.html : 2
*/


api = [
	"https://api.github.com/search/repositories?q=",
	"+in:name&type=Repositories&per_page=50",
	"https://api.github.com/repos/",
	"/contributors?per_page=100000&anon=1",
	"https://api.github.com/repos/",
	"/commits?per_page=100",
	"+in:name+user:",
	"&type=Repositories&per_page=50"
],


token = "&client_id=e8ce07d7ca81454ca7ca&client_secret=58e01a1e64bc997753cf364b80f53d922468722c",


re = {
	root_cut: new RegExp("^(\/[^\/]+){" + root_level + "}"),
	target_cut: /\/[^\/]+\/([^\/]+\/[^\/]+)/,
	visu_cut: /((\/[^\/]+){1,3})/,
	safari : /^((?!chrome|android).)*safari/i
},


title = [
	document.title.split(":")[0],
	" \\ Mangrove ~ interfaces / Equatorium"
],


plug = {
	gradient: "css/prod.css",
	history: "js/prod/jquery.history.js",
	history_adapter: "js/prod/jq-history-adapter.js",
	promises: "js/prod/es6-promise.min.js",
	simulate: "js/prod/jquery.simulate.js"
};


