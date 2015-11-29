/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */



(function () { //to patch history.js (https://github.com/browserstate/history.js)
	"use strict";

if (history.init) //MSIE 9 load twice
	return;

	history = window.History;
	for (var k in window.History)
		history[k] = window.History[k];
	history.init = true;
	history.state = window.History.getState().data;
	history.state.step = 0;
	window.History.Adapter.bind(window, "statechange", function (e) {
		history.state = window.History.getState().data;
	});

})();


/* on MSIE 9 with history.js
history.pushState({}, "", "coucou"); //				/#./coucou
history.pushState({}, "", "coucou/"); //			/#coucou/
history.pushState({}, "", "/coucou"); //			/#/coucou
history.pushState({}, "", "/coucou/"); //			/#/coucou/
history.pushState({}, "", "coucou/ciyciy"); //		/#coucou/ciyciy
history.pushState({}, "", "/coucou/ciyciy"); //		/#/coucou/ciyciy
*/

