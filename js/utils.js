/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */


var utilities = {

	newnav: false,

	toGetPath: function () {
		"use strict";
		var path0 = decodeURIComponent(location.pathname),
			path1 = path0.substring(1),
			path_short1 = path1.length > 0 ? path1.split("/")[0] : false,
			path_short2 = path_short1 ? path_short1.split(":")[0] : null,
			path_user1 = path_short1 ? path_short1.split(":") : false,
			path_user2 = (path_user1 && path_user1.length > 1) ? ":" + path_user1[1] : "",
			path_full = (path_short2 && re.path_full.test(path0)) ?
				path1.substring(path_short1.length + 1) :
				null;
		return [path_short2, path_full, path_user2];
	},

	toFormatDecimal: function (n) {
		"use strict";
		return n < 10 ? "0" + n : n;
	},

	toGetDate: function (date) {
		"use strict";
		return utilities.toFormatDecimal(date.getDate()) + "/" + utilities.toFormatDecimal(date.getMonth()) + "/" + date.getFullYear();
	},

	toGetFullDate: function (date) {
		"use strict";
		return utilities.toGetDate(date) + " (" + date.getHours() + "h" + utilities.toFormatDecimal(date.getMinutes()) + ")";
}	};


$(window).on("keydown", function (e) {
	"use strict";
	var key = e.which;
	utilities.newnav = key == 16 || key == 17 || key == 224 ? true : false;
}).on("keyup", function (e) {
	"use strict";
	utilities.newnav = false;
});


var styles = {
	$b: $("body"),
	toggle: function (c, val) {
		"use strict";
		this.$b.toggleClass(c, val);
		return this;
	},
	loadingProgress: function (val) {
		"use strict";
		return this.toggle("loading", val);
	},
	hidingRepos: function (val) {
		"use strict";
		return this.toggle("hiding", val);
}	};



