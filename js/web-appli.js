/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */


(function () {
	"use strict";

	var nav = {
			hstate: -1,
			path: utilities.getPath() /* exemple:
http://www.domain.tld/githubapi/form:malsup/malsup/form/enoutre
	root:			/githubapi
	visu:			/form:malsup/malsup/form
	repo_query:		form
	repo_owner:		:malsup
	repo_target:	malsup/form
	pathfull:		/form:malsup/malsup/form/enoutre
*/
		},
		contentRepo = document.getElementById("contentRepo"),
		$user;

	nav.path.visu != nav.path.pathfull
	&& ! history.replaceState(
		{ step: history.state },
		nav.path.visu,
		nav.path.root + nav.path.visu)
	&& (nav.path = utilities.getPath());

	utilities.detectKeyboard();





/* ----------------------------------------------------------------------------------------------------------------------------------
PART 1 : ALL REPOS REQUEST */



	var ContentBox = React.createClass({

		getInitialState: function () {
			return {
				init: false,
				request: null,
				user: null,
				total_count: 0,
				items: [],
				status: null
		};	},

		loadReposFromAPI: function (q, val) {
			/*	q : string
				val === true via handle submission (ReposForm.handleSubmit)
				val === false via history (ReposForm.crossHistory)
				val === false via first loaded submission (ReposForm.componentDidMount, with final impact on ReposDetail.followDeeper)
			*/

			var request_repo = q.split("/")[0],
				user = $user.val().trim(),
				huser = user.length == 0 ? "" : ":" + user,
				url = huser.length == 0 ?
					api[0] + request_repo + api[1] + token :
					api[0] + request_repo + api[6] + user + api[7] + token;

			val === true
			&& (nav.path.repo_target = null); //note: when identic initial search from detailled result page, it display again detailled result
			styles.loadingProgress(true);

			$.ajax({
				url: url,
				dataType: "json",
				cache: false,
				success: function (got, status, xhr) {
					this.setState({
						init: true,
						request: request_repo,
						user: huser,
						total_count: got.total_count,
						items: got.items,
						status: [status, xhr.status]
					});
					document.title = title + ": /" + request_repo;
					val === true //no pushState when navigation via history cf. ReposForm.crossHistory
					&& (nav.path.visu.substring(1) != request_repo + huser)
					&& (nav.hstate = history.state === null ? 1 : history.state.step + 1)
					&& ! history.pushState(
							{ step: nav.hstate },
							request_repo + huser,
							nav.path.root + "/" + request_repo + huser)
					&& (nav.path = utilities.getPath());
				}
				.bind(this),
				error: function (xhr, status, err) {
					console.error(api[0] + request_repo + api[1], status, err.toString());
					/*
						possibility of error when user has no public repo
						for instance: https://github.com/in?tab=repositories ; https://github.com/inter?tab=repositories
					*/
					this.success({ total_count: 0, items: []}, status, xhr);
			}	});
			return true;
		},

		render: function () {

			ReactDOM.unmountComponentAtNode(contentRepo);

			styles.loadingProgress(false)
			.hidingRepos(false);

			return (
				<div>
					<ReposForm
						onFormSubmit={this.loadReposFromAPI} />
					<ReposList
						init={this.state.init}
						request={this.state.request}
						user={this.state.user}
						total_count={this.state.total_count}
						items={this.state.items}
						status={this.state.status} />
				</div>
	);	}   });


	var ReposForm = React.createClass({

		handleSubmit: function (e) { //manual submission of form
			e.preventDefault();

			var repo = this.refs.repo.value.trim().split("/")[0];

			!! repo
			&& (this.refs.repo.value = repo)
			&& this.props.onFormSubmit(repo, true);
		},

		crossHistory: function () { //trigger either clik on link to close detailled result, either submission of form
			nav.path = utilities.getPath();

			this.refs.repo.value = nav.path.repo_query;

			$user.val(nav.path.repo_owner.substring(1));

			nav.path.repo_query !== null
			&&	(	(	(history.state === null || nav.hstate > history.state.step) //when history back from detailled result, return to initial result by css effect (RepoInfo.closeRepoInfo)
						&& nav.path.repo_target == null
						&& $(".close").length > 0
						&& ! $(".close").get(0).click()
					)
					|| this.props.onFormSubmit(nav.path.repo_query, false)
					&& (nav.hstate = history.state === null ? -1 : history.state.step)
				)
		},

		componentDidMount: function () { //to load datas from url
			// if (this.isMounted)
			$user = $("#user");

			window.onpopstate = this.crossHistory;

			this.refs.repo.focus();

			nav.path.repo_query !== null
			&&	(	(this.refs.repo.value = nav.path.repo_query)
					&&	(	nav.path.repo_owner !== null
							&& $user.val(nav.path.repo_owner.substring(1))
						)
					|| true
				)
			&& this.props.onFormSubmit(nav.path.repo_query, false);
		},

		render: function () {
			return (
				<form onSubmit={this.handleSubmit} action="#" method="get">
					<input type="search" ref="repo" />
					<input type="submit" value="Chercher" />
					<input type="search" id="user" placeholder="(utilisateur comme option)" />
				</form>
	);	}   });


	var ReposList = React.createClass({

/* to do: as there are often 50 instances of ReposDetail, to check if it is lighter
	to define followDeeper aa handleGetDetails in ReposDetail,
	or to pass it at ReposDetail as a props? */

		followDeeper: function (that) { //that: binded from ReposDetail like handleGetDetails
			if (this.hollowed)
				return;
			that.props.r_api
			&& nav.path.repo_target
			&&	(	(	that.props.r_api.split(nav.path.repo_target)[0] == api[4] //same url and link: open detailled result
						&& (this.hollowed = true)
						&& this.getDetails(that)
						&& $("[href*='" + nav.path.visu + "']").addClass("active")
					)
					||
					(	that.props.r_last //no link identical to url: clear url
						&& ! history.replaceState(
							{ step: history.state },
							"/" + nav.path.repo_query + nav.path.repo_owner,
							nav.path.root + "/" + nav.path.repo_query + nav.path.repo_owner)
						&& (nav.path = utilities.getPath())
					)
				);
		},

		handleGetDetails: function (that, e) { //that: from ReposDetail this via second argument of bind function
/* to do: to check that component could not be directly binded (form child component)
	cf. onClick={this.props.handleGetDetails.bind(null, this)} */
			if (utilities.newnav)
				return;
			e.preventDefault();
			$(".active").removeClass("active");
			$(e.target).addClass("active");
			this.getDetails(that);
		},

		getDetails: function (that) { //that: binded from ReposDetail
			styles.loadingProgress(true);
			$.when(1) // empty promise
			.then(function () {
				return $.ajax({
					url: api[2] + that.props.r_login + "/" + that.props.r_name + api[3] + token,
					dataType: "json",
					cache: false,
					error: function (xhr, status, err) {
						console.error(api[2] + that.props.r_name + api[3], status, err.toString());
						styles.loadingProgress(false);
			}	})	}
			.bind(that))
			.then(function (gotContrib) {
				return $.ajax({
					url: api[4] + that.props.r_login + "/" + that.props.r_name + api[5] + token,
					dataType: "json",
					cache: false,
					success: function (gotCommit) {
						ReactDOM.render(
							<RepoInfo
								r_name={that.props.r_name}
								r_login={that.props.r_login}
								r_github={that.props.r_github}
								r_github_title={that.props.r_github_title}
								r_profile={that.props.r_profile}
								r_profile_title={that.props.r_profile_title}
								r_avatar={that.props.r_avatar}
								index={that.props.index}
								len={that.props.len}
								gotContrib={gotContrib}
								gotCommit={gotCommit} />,
							contentRepo
					)	}
					.bind(that),
					error: function (xhr, status, err) {
						console.error(api[4] + that.props.r_name + api[5], status, err.toString());
						this.success(xhr.responseJSON);
			}	})	}
			.bind(that));
			return true;
		},

		rawMarkup: function (string) {
			return { __html: marked(string.toString(), {sanitize: true}) };
		},

		componentWillMount: function () {
			this.hollowed = false;
		},

		componentWillUpdate: function () {
			this.hollowed = false;
			$(".active").removeClass("active");
		},

		render: function () {
			var handleGetDetails = this.handleGetDetails,
				followDeeper = this.followDeeper,
				len = this.props.items.length,
				request = this.props.request,
				user = this.props.user,
				className = "content " + this.props.init,

				reposNodes = len <= 0 ?

					<ReposDetail
						handleGetDetails={handleGetDetails}
						followDeeper={followDeeper}
						dname=""
						dclass="off"
						dapi="#"
						dgithub="#" /> :

					this.props.items.map(function (repo, index) {
						var r_api_title = "Dépôt '" + repo.full_name + "' : détails de ses contributeurs et commits",
							r_github_title = "Dépôt '" + repo.full_name + "' sur Github (nouvelle fenêtre)",
							r_avatar_title = "Profil '" + repo.owner.login + "' sur Github (nouvelle fenêtre)",
							r_path = document.location.protocol + "//" + document.location.host + nav.path.root + "/" + request + user + "/" + repo.full_name;

						return (
							<ReposDetail
								handleGetDetails={handleGetDetails}
								followDeeper={followDeeper}
								r_login={repo.owner.login}
								r_name={repo.name}
								r_class="on"
								r_api={repo.url}
								r_api_title={r_api_title}
								r_github={repo.html_url}
								r_github_title={r_github_title}
								r_path={r_path}
								r_last={index==len-1}
								r_profile={repo.owner.html_url}
								r_profile_title={r_avatar_title}
								r_avatar={repo.owner.avatar_url}
								index={index}
								len={len} />
					);	}),

				result = this.props.init == false ?

					"" :

					(len == 0 ? "Il n'y a aucun résultat dont le nom contienne le terme __" + request + "__" :
						len == this.props.total_count ?
							"*__"
							+ len
							+ "__* dépôt" + (len > 1 ? "s " : " ")
							+ "dont le nom contient le terme __"
							+ request
							+ "__"
							:
							"*__"
							+ len
							+ "__* dépôts sur *__"
							+ this.props.total_count
							+ "__* dont le nom contient le terme __"
							+ request
							+ "__"
					)
					+ ((user = $user.val().trim()) ? " et l'utilisateur " + (len == 0 ? "soit __" : "est __") + user + "__": "")
					+ ((this.props.status[0] == "error" && this.props.status[1] == 422) ? (" - *celui-ci semble n'avoir aucun dépôt public*") : "")
					+ (len == 0 ? "" : " :");

			return (
				<div id="resultsRepos"  className={className}>
					<div dangerouslySetInnerHTML={this.rawMarkup(result)} />
					<ol>
						{reposNodes}
					</ol>
				</div>
	);	}   });


	var ReposDetail = React.createClass({

		componentDidMount: function () {
			this.props.followDeeper.call(null, this); //cf. handleGetDetails
		},

		componentDidUpdate: function () {
			this.props.followDeeper.call(null, this); //cf. handleGetDetails
		},

		render: function() {
			return (
				<li className={this.props.dclass}>
					{this.props.r_login} : <a
						href={this.props.r_path}
						title={this.props.r_api_title}
						onClick={this.props.handleGetDetails.bind(null, this)} //cf. handleGetDetails
						target="_blank">
						{this.props.r_name}
					</a>
				</li>
	);	}	});

	ReactDOM.render(
		<ContentBox />,
		document.getElementById("contentRepos")
	);





/* ----------------------------------------------------------------------------------------------------------------------------------
	PART 2 : ONE REPO REQUEST except timeline */



	var RepoInfo = React.createClass({

		getInitialState: function () {
			return {
				url: nav.path.visu
		};	},

		closeRepoInfo: function (e) {
			e.preventDefault();

			ReactDOM.unmountComponentAtNode(contentRepo);

			styles.hidingRepos(false);

			this.setState({
				url: "/" + nav.path.repo_query
			});

			document.title = title + ": /" + nav.path.repo_query;
			(	nav.hstate != -1 //going back in history cf. crossHistory
				&&
				(	(	history.state === null
						&& (nav.hstate = -1)
					)
					||
					(	nav.hstate > history.state.step
						&& (nav.hstate = history.state.step)
			)	)	)
			|| //going forward in history
			(	(nav.hstate = history.state === null ? 1 : history.state.step + 1)
				&& ! history.pushState(
					{ step: nav.hstate },
					"/" + nav.path.repo_query,
					nav.path.root + "/" + nav.path.repo_query + nav.path.repo_owner)
				&& (nav.path = utilities.getPath())
			);

			$(".active").length > 0
			&& $(".active").get(0).focus();

		},

		repoPrevious: function (e) {
			e.preventDefault();

			ReactDOM.unmountComponentAtNode(contentRepo);

			styles.hidingRepos(false);

			$("#resultsRepos li:eq(" + (this.props.index - 1) + ") a").get(0).click();
		},

		repoNext: function (e) {
			e.preventDefault();

			ReactDOM.unmountComponentAtNode(contentRepo);

			styles.hidingRepos(false);

			$("#resultsRepos li:eq(" + (this.props.index + 1) + ") a").get(0).click();
		},

		render: function () {
			var repoInfoDetail = ! this.props.gotCommit.message ?
				[
					<RepoUser gotContrib={this.props.gotContrib} />,
					<RepoCommit gotCommit={this.props.gotCommit} nbContrib={this.props.gotContrib.length} />
				]
				:
				<RepoError gotError={this.props.gotCommit.message} />,
				previous = this.props.index == 0 ? "" : ["\uF044", "Précédent"],
				classPrevious = this.props.index == 0 ? "inactive" : "",
				next = this.props.index == this.props.len - 1 ? "" : ["\uF05A", "Suivant"],
				classNext = this.props.index == this.props.len - 1 ? "inactive" : "";

			styles.loadingProgress(false)
			.hidingRepos(true);

			document.title = title + ": " + this.state.url.split("/")[1] + "/" + this.props.r_login + "/" + this.props.r_name;

			"/" + nav.path.repo_query + nav.path.repo_owner + "/" + this.props.r_login + "/" + this.props.r_name != this.state.url
			&& (nav.hstate = history.state === null ? 1 : history.state.step + 1)
			&& ! history.pushState(
				{ step: nav.hstate },
				this.props.r_name + " de " + this.props.r_login,
				nav.path.root + "/" + nav.path.repo_query + nav.path.repo_owner + "/" + this.props.r_login + "/" + this.props.r_name)
			&& (nav.path = utilities.getPath());

			return (
				<div>
					<a href="#" className="close" onClick={this.closeRepoInfo}>
						<span className="navIcon">&#xF062;</span> Résultats initiaux <span className="navIcon">&#xF0AA;</span>
					</a>
					<div className="clear">
						<hr />
					</div>
					<p className="trans">
						<a href="#" onClick={this.repoPrevious} className="classPrevious">
							<span className="navIcon">{previous[0]}</span> {previous[1]}
						</a> <span className="order">{this.props.index + 1} / {this.props.len}</span> <a href="#" onClick={this.repoNext} className="classNext">
							{next[1]} <span className="navIcon">{next[0]}</span>
						</a>
					</p>
					<h2>
						Détails du dépôt <a href={this.props.r_github} title={this.props.r_github_title} target="_blank" className="more moreRepo"> </a>
						<strong>{this.props.r_name}</strong> de
						<a href={this.props.r_profile} target="_blank" className="more">
							<img src={this.props.r_avatar} alt={this.props.r_profile_title} width="25" height="25" />
						</a>
						<strong>{this.props.r_login}</strong>
					</h2>
					<div className="clear">
						{repoInfoDetail}
					</div>
					<div id="timeline">
					</div>
				</div>
	);	}	});


	var RepoError = React.createClass({

		render: function() {
			var messages = [
				"Une erreur empêche d'accéder aux détails de ce dépôt",
				"Ce dépôt est vide"
			]
			return (
				<div className="error">{messages[(this.props.gotError.indexOf("empty") > -1) * 1]}</div>
	)	}	});


	var RepoUser = React.createClass({ //from contributors JSON

		render: function() {
			var repoUsers = this.props.gotContrib.map(function (user) {
					var contributor = user.type == "Anonymous" ?
						user.name + " (anonyme)" : //anonymous
						user.login;
					return (
						<RepoUserInfo login={contributor} />
				);	}),

				users = repoUsers.length == 100 ?
					"Au moins 100 contributeurs" :
					repoUsers.length + " contributeur" + (repoUsers.length == 1 ? "" : "s") + " :";

			return (
				<div className="left">
					<h3>
						{users}
					</h3>
					<ol className="users">
						{repoUsers}
					</ol>
				</div>
	);	}	});


	var RepoUserInfo = React.createClass({

		render: function () {
			return (
				<li>
					{this.props.login}
				</li>
	);	}	});


	var RepoCommit = React.createClass({ //from commits JSON

		/* this.setProps({}) in calculateCommitters() makes an error */
		repoCommittersG: null, //to do: how to communicate value inside object without state nor setProps (in ES6 no more valid)?

		quant: "",

		calculateCommitters: function () {

			var users = [],
				usersKeys,
				usersSorted = [],
				number = 0,
				committers,
				repoCommitters,
				repoCommits;

			repoCommits = this.props.gotCommit.map(function (user) {
				return user.author ?
					user.author.login :
					user.commit.author.name + " (an.)"; //anonymous
			}).sort();
/* console.log(repoCommits)
	["LRotherfield", "LRotherfield", "LRotherfield", "Luke Rotherfield (an.)", "Luke Rotherfield (an.)",
	"Luke Rotherfield (an.)", "root (an.)", "root (an.)", "sebastien-roch", "sgilberg"] */

			repoCommits.map(function (user) { //remove duplicates //to do: better than 'forEach'?
				typeof users[user] !== "undefined" ?
					++ users[user] :
					users[user] = 1;
			});
/* console.log(users)
	LRotherfield 	3
	Luke Rotherfield (an.)	3
	root (an.)	2
	sebastien-roch 	1
	sgilberg 	1 */

			usersKeys = Object.keys(users); //to do: better than 'for (var k in users)'?
			usersKeys.map(function (key) {
				++ number;
				typeof usersSorted[users[key]] !== "undefined" ?
					usersSorted[users[key]][0].push(key) :
					usersSorted[users[key]] = [[key], users[key]];
			});
/* console.log(usersSorted)
	[undefined, [["sebastien-roch", "sgilberg"], 1], [["root (an.)"], 2], [["LRotherfield", "Luke Rotherfield (an.)"], 3]] */

			users = [];

			committers = number == this.props.nbContrib ?
				(repoCommits.length == 1 ?
					"1 commit :"
					:
					(repoCommits.length == 100 ?
						"Sur les " + (this.quant = "100 derniers " ) + "commits :"
						:
						(this.quant = repoCommits.length) + " commits :"
					)
				)
				:
				"Dont " + number + " contributeurs sur les " + (this.quant = "100 derniers ") + " commits :";

			repoCommitters = usersSorted.reverse().map(function (user) {
				/* console.log(user)
					[["LRotherfield", "Luke Rotherfield (an.)"], 3] */
				user[0].sort(function (a, b) {
					return a.toLowerCase().localeCompare(b.toLowerCase());
				});
				users.push(user);
				return user[0].map(function (u) {
					return (
						<RepoCommitInfo user={u} commits={user[1]} />
			);	});	});
/* console.log(users)
	[[["LRotherfield", "Luke Rotherfield (an.)"], 3], [["root (an.)"], 2], [["sebastien-roch", "sgilberg"], 1]] */

			this.repoCommittersG = users; //for timeline

			return [committers, repoCommitters]; //for render function
		},

		componentDidMount: function() {
			ReactDOM.render(
				<Timeline
					gotCommit={this.props.gotCommit}
					list={this.repoCommittersG}
					quant={this.quant} />,
				document.getElementById("timeline")
		);	},

		render: function() {
			var commits = this.calculateCommitters();
			return (
				<div className="right">
					<h3>
						{commits[0]}
					</h3>
					<ol className="users">
						{commits[1]}
					</ol>
				</div>
	);	}	});


	var RepoCommitInfo = React.createClass({

		render: function () {
			var presentation = this.props.commits == 1 ? " commit" : " commits";
			return (
				<li>
					{this.props.user} : {this.props.commits}
					{presentation}
				</li>
	);	}	});





/* ----------------------------------------------------------------------------------------------------------------------------------
	PART 3 : ONE REPO REQUEST TIMELINE */



	var Timeline = React.createClass({

		determineContributors: function () {
/*
- to create object
with login as key and login as value if at less 5 commits
or login as key and "divers" as value if less than 5 commits
- to create object
to associate all possible values of previous object, with its number of commits

cf. console.log in render function */
			var contributors = [],
				commitPerContribShortList = [];

			this.props.list.map(function (cont) {
				cont[0].map(function (con) {
					contributors[con] = cont[1] < 5 ? "= divers" : con; //less than 5 commits, return "divers" else return contributor name
					typeof commitPerContribShortList[contributors[con]] === "undefined"
					&& (commitPerContribShortList[contributors[con]] = cont[1])
					|| (commitPerContribShortList[contributors[con]] += cont[1]);
				}
				.bind(this));
			}
			.bind(this));

			return [contributors, commitPerContribShortList];
		},

		calculateDates: function () {
			return this.props.gotCommit.map(function (com) {
				return [new Date(com.commit.author.date), (com.author && com.author.login) || com.commit.author.name + " (an.)"];
			}).sort(function (a, b) {
				return a[0] - b[0];
		});	},

		render: function () {
			var slice = this.determineContributors(),
				contributors = slice[0],
				commitPerContribShortList = slice[1],
/* console.log(contributors)
	LRotherfield	"divers"
	Luke Rotherfield (an.)	"divers"
	root (an.)	"divers"
	sebastien-roch	"divers"
	sgilberg	"divers" */
/* console.log(commitPerContribShortList)
	divers	10 */

				dates = this.calculateDates(),
				dlast = dates.length - 1,
				start = dates[0][0];

			if (dlast === 0)
				return (
					<table>
						<caption title="Un seul commit">
							Un seul commit
						</caption>
						<tr className="totaux solo">
							<td>Commit effectué le {utilities.getFullDate(start)}</td>
						</tr>
					</table>
				);


			var	startMs = start.getTime(),
				end = dates[dlast][0],
				duration = (end - start),
				slice = duration / 50,
/* console.log(dates)
	[
		[Date {Thu Aug 01 2013 22:13:36 GMT+0200 (CEST)}, "root (an.)"],
		[Date {Thu Aug 01 2013 22:17:57 GMT+0200 (CEST)}, "root (an.)"],
		[Date {Thu Aug 01 2013 22:21:07 GMT+0200 (CEST)}, "Luke Rotherfield (an.)"],
		[Date {Thu Aug 01 2013 22:37:53 GMT+0200 (CEST)}, "Luke Rotherfield (an.)"],
		[Date {Thu Aug 01 2013 22:38:57 GMT+0200 (CEST)}, "Luke Rotherfield (an.)"],
		[Date {Fri Aug 30 2013 22:20:22 GMT+0200 (CEST)}, "LRotherfield"],
		[Date {Tue Sep 03 2013 09:27:53 GMT+0200 (CEST)}, "sebastien-roch"],
		[Date {Tue Sep 03 2013 12:54:20 GMT+0200 (CEST)}, "LRotherfield"],
		[Date {Thu Jun 18 2015 16:44:40 GMT+0200 (CEST)}, "sgilberg"],
		[Date {Fri Jun 19 2015 10:08:48 GMT+0200 (CEST)}, "LRotherfield"]
	] */

//table head
				intoHead = [[start, new Date(startMs + slice), startMs]],
//table head: to render header of table
				timelineHead,

//table "line"
				intoLine = [0],
				intoLineHeight,
//table "line": GRAPHICAL RENDERING date by date
				timelineLine,
//table "line" total: NUMERIC RENDERING date by date
				timelineTotal,

//table details: commits date by date for each contributor (short list)
				intoDetails = [],
//table details: to render footer like of table
				timelineDetails = [];


			for (var k in contributors) { //to do: cf. Object.keys?
				typeof intoDetails[contributors[k]] === "undefined"
				&& (intoDetails[contributors[k]] = [0]); //to begin to initialise: each item is an array
			}




/* TABLE HEAD */

			intoHead[0][3] = intoHead[0][1].getTime(); //initialisations

			for (var i = 1; i < 50; ++i) { //initialisations //to do: cf. Object.keys?
				intoHead[i] = [new Date(intoHead[i - 1][2] + slice), new Date(intoHead[i - 1][3] + slice)];
				intoHead[i][2] = intoHead[i][0].getTime();
				intoHead[i][3] = intoHead[i][1].getTime();
				intoLine[i] = 0; //to finish to initialise for 50 numerical entries
				for (var k in intoDetails) //to finish to initialise: each item is an array of 50 numerical entries //to do: cf. Object.keys?
					intoDetails[k][i] = 0;
			}

			timelineHead = intoHead.map(function (date, index) { //render head
				return <TimelineThead date0={date[0]} date1={date[1]} index={index + 1} />
			});




/* TABLE "LINE" */

			dates.map(function (d, index) { //commits count
/*
to count commits by date
and to count commits for each contributor (short liste) by date
*/
				var item = Math.floor((d[0].getTime() - startMs - /* for last item */ Math.floor(index / dlast)) / slice);
				intoLine[item] ++; //to count commits
				typeof contributors[d[1]] !== "undefined"
				&& intoDetails[contributors[d[1]]][item] ++; //to count commits / contr.
			});

			timelineLine = intoLine.map(function (val) { //visual rendering
				return <TimelineTbodyLine val={val} />
			});

			timelineTotal = intoLine.map(function (val) { //numerical rendering
				return <TimelineTbodyTotal val={val} />
			});

			intoLineHeight = intoLine.sort().reverse()[0] < 3 ?
				{ height: "8em" } //https://facebook.github.io/react/tips/inline-styles.html
				:
				{};



/* TABLE DETAILS */

			for (var k in intoDetails) //to do: cf. Object.keys?
				timelineDetails.push(<TimelineTbodyDetails
					con={k}
					commitPerShortL={commitPerContribShortList}
					details={intoDetails[k]} />);



/* GLOBAL TABLE RENDER */
			return (
				<table>
					<caption title="Chronologie des derniers commits, à partir des plus anciens en premières colonnes,
						et avec détail des contributeurs les plus importants à partir de la troisième ligne du tableau">
						Chronologie des {this.props.quant} commits sur {Math.round(duration / (100 * 60 * 60 * 24 * 7)) / 10} semaines<br />du {utilities.getFullDate(start)}<br />au {utilities.getFullDate(end)}
					</caption>
					<thead>
						<tr>
							<th scope="row">Tranches</th>
							{timelineHead}
						</tr>
					</thead>
					<tbody>
						<tr className="time">
							<th scope="row" style={intoLineHeight} >Timeline</th>
							{timelineLine}
						</tr>
						<tr className="totaux">
							<th scope="row">Totaux</th>
							{timelineTotal}
						</tr>
						{timelineDetails}
					</tbody>
				</table>
	);	}	});



	var TimelineThead = React.createClass({

		render: function () {
			var title = "Du " + utilities.getFullDate(this.props.date0) + " au " + utilities.getFullDate(this.props.date1),
				date = this.props.index == 1 || this.props.index % 5 == 0 ? utilities.toGetDate(this.props.date0) : "";
			return (
				<th scop="col">
					<abbr title={title}>
						{this.props.index}
					</abbr>
					<code>
						{date}
					</code>
				</th>
	);	}});


	var TimelineTbodyLine = React.createClass({

		render: function () {
			var content = this.props.val == 0 ? "" : this.props.val + " commits",
				style = { height: this.props.val + ".1em" }; //https://facebook.github.io/react/tips/inline-styles.html
			return (
				<td>
					<strong style={style} title={content}>{content}</strong>
				</td>
	);	}	});


	var TimelineTbodyTotal = React.createClass({

		render: function () {
			var content = this.props.val == 0 ? "" : this.props.val;
			return (
				<td>
					{content}
				</td>
	);	}	});


	var TimelineTbodyDetails = React.createClass({

		render: function () {
			var timelineDetailsCell = this.props.details.map(function (val) {
				return <TimelineTbodyDetailsCell val={val} />
			});
			return (
				<tr>
					<th scope="row">{this.props.con} ({this.props.commitPerShortL[this.props.con]})</th>
					{timelineDetailsCell}
				</tr>
	);	}	});


	var TimelineTbodyDetailsCell = React.createClass({

		render: function () {
			var v = this.props.val > 0 ? this.props.val : "";
			return (
				<td>{v}</td>
	);	}	});



} )();


