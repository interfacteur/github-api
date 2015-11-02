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

toGetPath = function () {
	"use strict";
	var path0 = decodeURIComponent(location.pathname),
		path1 = path0.substring(1),
		path_short = path1.length > 0 ? path1.split("/")[0] : null,
		path_full = (path_short && re.path_full.test(path0)) ?
			path1.substring(path_short.length + 1) :
			null;
	return [path_short, path_full];
}
