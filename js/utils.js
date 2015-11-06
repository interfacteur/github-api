/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */


var utilities = {

	newnav: false,

	toGetPath: function () {
		"use strict";
		var path0 = decodeURIComponent(location.pathname),
			path1 = path0.substring(1),
			path_short = path1.length > 0 ? path1.split("/")[0] : null,
			path_full = (path_short && re.path_full.test(path0)) ?
				path1.substring(path_short.length + 1) :
				null;
		return [path_short, path_full];
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



