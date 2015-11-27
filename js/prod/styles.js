/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */


//gradient fallback cf. http://stackoverflow.com/questions/10853507/simple-css-gradient-detection
;(function () {
	"use strict";

	var elem = document.createElement("div"),
		style = elem.style,
		link;

	style.backgroundImage = "repeating-linear-gradient(0deg, #FFF, #FFF .95em, #8ADD6D .95em, #8ADD6D 1.05em, #FFF 1.05em)";
	style.backgroundImage = "-moz-repeating-linear-gradient(0deg, #FFF, #FFF .95em, #8ADD6D .95em, #8ADD6D 1.05em, #FFF 1.05em)";
	style.backgroundImage = "-webkit-repeating-linear-gradient(0deg, #FFF, #FFF .95em, #8ADD6D .95em, #8ADD6D 1.05em, #FFF 1.05em)";

	if (style.backgroundImage.indexOf("gradient") !== -1) //Safari 5?
		return;

	link = document.createElement("link");
	link.href = plug.gradient;
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);

})();
