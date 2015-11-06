/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */


var api = [
	"https://api.github.com/search/repositories?q=",
	"+in:name&type=Repositories&per_page=50",
	"https://api.github.com/repos/",
	"/contributors?per_page=100000&anon=1",
	"https://api.github.com/repos/",
	"/commits?per_page=100",
	"+in:name+user:",
	"&type=Repositories&per_page=50"
];

/* to do: protéger (permet de multiples requêtes rapprochées sans erreur) */
var token = "&client_id=e8ce07d7ca81454ca7ca&client_secret=58e01a1e64bc997753cf364b80f53d922468722c";



var re = {
	path_full: /^\/[^\/]+\/[^\/]+\/[^\/]+$/
}


var title = document.title.split(":")[0];

