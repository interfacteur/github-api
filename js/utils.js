/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */


var utilities = {

	toShuntBi: function (n) { //-1 => 0 ; 0 => 0 ; n => 1
		"use strict";
		var x = Math.floor((n + 1) * 2 / 3);
		return Math.ceil(x / (x + 1));
	},

	toShuntTri: function (n) { //-1 => 0 ; 0 => 1 ; n => 2
		"use strict";
		return Math.ceil(n / (n + 2)) + 1;
	},

	toShuntBi12N1: function (n) { //1 => 2 ; n => 1
		"use strict";
		return Math.floor(n / (n * n)) + 1;
	},

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

	toGetDate: function (date) {
		"use strict";
		var d = date.getDate(),
			dF = d < 10 ? "0" + d : d,
			m = date.getMonth() + 1,
			mF = m < 10 ? "0" + m : m;
		return dF + "/" + mF + "/" + date.getFullYear();
	},

	toGetFullDate: function (date) {
		"use strict";
		return utilities.toGetDate(date) + " (" + date.getHours() + "h" + date.getMinutes() + ")";
}	};


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



