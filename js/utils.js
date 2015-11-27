/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */



var utilities = {

//analyze url
	getPath: function () {
		"use strict";
		var pathname = decodeURIComponent(location.pathname),
			_root = pathname.match(re.root_cut)[0],
			_path = pathname.split(_root)[1],
			tract1 = _path.substring(1),
			tract2 = tract1.length > 0 ? tract1.split("/")[0] : false,
			_query = tract2 ? tract2.split(":")[0] : null,
			tract3 = tract2 ? tract2.split(":")[1] : false,
			_owner = (tract3 && tract3.length > 0) ? ":" + tract3 : "",
			tract4 = _path.match(re.target_cut),
			_target = tract4 ? tract4[1] : null,
			tract5 = _path.match(re.visu_cut),
			_visu = tract5 ? tract5[1] : "/";

		return {
			root: _root,
			visu: _visu,
			repo_query: _query,
			repo_owner: _owner,
			repo_target: _target,
			pathfull: _path,
			uri_base: document.location.protocol + "//" + document.location.host + _root + "/" //(added later)
/*
	EXEMPLES:

http://www.domain.tld/githubapi/
	root:			/githubapi
	visu:			/
	repo_query:		null
	repo_owner:		""
	repo_target:	null
	pathfull:		/

http://www.domain.tld/githubapi/form
	root:			/githubapi
	visu:			/form
	repo_query:		form
	repo_owner:		""
	repo_target:	null
	pathfull:		/form

http://www.domain.tld/githubapi/form:malsup
	root:			/githubapi
	visu:			/form:malsup
	repo_query:		form
	repo_owner:		:malsup
	repo_target:	null
	pathfull:		/form:malsup

http://www.domain.tld/githubapi/form/malsup/form
	root:			/githubapi
	visu:			/form/malsup/form
	repo_query:		form
	repo_owner:		""
	repo_target:	malsup/form
	pathfull:		/form/malsup/form

http://www.domain.tld/githubapi/form:malsup/malsup/form
	root:			/githubapi
	visu:			/form:malsup/malsup/form
	repo_query:		form
	repo_owner:		:malsup
	repo_target:	malsup/form
	pathfull:		/form:malsup/malsup/form

				http://www.domain.tld/githubapi/form/malsup/form/enoutre
					root:			/githubapi
					visu:			/form/malsup/form
					repo_query:		form
					repo_owner:		""
					repo_target:	malsup/form
					pathfull:		/form/malsup/form/enoutre

				http://www.domain.tld/githubapi/form:malsup/malsup/form/enoutre
					root:			/githubapi
					visu:			/form:malsup/malsup/form
					repo_query:		form
					repo_owner:		:malsup
					repo_target:	malsup/form
					pathfull:		/form:malsup/malsup/form/enoutre

				http://www.domain.tld/githubapi/form/malsup/form/enoutre/encore
					root:			/githubapi
					visu:			/form/malsup/form
					repo_query:		form
					repo_owner:		""
					repo_target:	malsup/form
					pathfull:		/form/malsup/form/enoutre/encore

				http://www.domain.tld/githubapi/form:malsup/malsup/form/enoutre/encore
					root:			/githubapi
					visu:			/form:malsup/malsup/form
					repo_query:		form
					repo_owner:		:malsup
					repo_target:	malsup/form
					pathfull:		/form:malsup/malsup/form/enoutre/encore
*/
	};	},


//fix numbers and dates
	formatDecimal: function (n) {
		"use strict";
		return n < 10 ? "0" + n : n;
	},

	toGetDate: function (date) {
		"use strict";
		return utilities.formatDecimal(date.getDate()) + "/" + utilities.formatDecimal(date.getMonth() + 1) + "/" + date.getFullYear();
	},

	getFullDate: function (date) {
		"use strict";
		return utilities.toGetDate(date) + " (" + date.getHours() + "h" + utilities.formatDecimal(date.getMinutes()) + ")";
	},


//capture keyboard events
	newnav: false,
	detectKeyboard: function () {
		"use strict";
		$(window).on("keydown", function (e) {
			"use strict";
			var key = e.which;
			utilities.newnav = key == 16 || key == 17 || key == 224 ? true : false;
		}).on("keyup", function (e) {
			"use strict";
			utilities.newnav = false;
	});	},


//toggle css classes
	styles: {
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
}	}	};



//add the production scripts
;(function () {
	"use strict";

	var $plug = $("#plug"),
		compat = [],
		compats = null,
		nua = navigator.userAgent;

	if ($plug.length == 0)
		return;

//emulation of API history
	(	typeof history === "undefined"
		||
		typeof history.state === "undefined"
	)
	&& compat.push(
		$("<script>", { "src" : plug.history }),
		$("<script>", { "src" : plug.history_adapter })
	);


//emulation of promises
	(	typeof Promise === "undefined"
		||
		Promise.toString().indexOf("[native code]") === -1
	)
	&& compat.push(
		$("<script>", { "src" : plug.promises })
	);


//bug of clic on Safari 5
	(	re.safari.test(nua)
		&& Number(nua.split("Safari/")[1].split(".")[0]) < 535 //Safari 5
		&& compat.push(
			$("<script>", { "src" : plug.simulate })
		)
	)
	|| ($.fn.simulate = function() {
		this.get(0).click();
	});


	if (compat.length == 0)
		return;

//add the necessary scripts
	compats = $("<div>");

	$.each(compat, function (i) {
		compats.append(compat[i]);
	});

	compats.insertAfter($plug);

})();


