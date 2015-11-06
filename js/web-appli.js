/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */


(function () {
	"use strict";
	var hstate = -1,
		$user;





/* ----------------------------------------------------------------------------------------------------------------------------------
PART 1 : ALL REPOS REQUEST */



	var ContentBox = React.createClass({

		getInitialState: function () {
			var path = utilities.toGetPath();
			return {
				init: false,
				request: null,
				user: null,
				total_count: 0,
				items: [],
				path_short: path[0],
				path_full: path[1],
				path_user: path[2]
		};	},

		loadReposFromAPI: function (q, val) {
			/*	q : string
				val === true via handle submission (ReposForm.handleSubmit)
				val === false via history (ReposForm.toCrossHistory)
				val === false via first loaded submission (ReposForm.componentDidMount, with final impact on toFollowDeeper)
			*/
			var request_repo = q.split("/")[0],
				user = $user.val().trim(),
				huser = user.length == 0 ? "" : ":" + user,
				path = utilities.toGetPath(),
				url = huser.length == 0 ?
					api[0] + request_repo + api[1] + token :
					api[0] + request_repo + api[6] + user + api[7] + token;
			val === true
			&& (path[1] = null); //when identic initial search form detailled result, it display again detailled result
			styles.loadingProgress(true);
			$.ajax({
				url: url,
				dataType: "json",
				cache: false,
				success: function (got) {
					this.setState({
						init: true,
						request: request_repo,
						user: huser,
						total_count: got.total_count,
						items: got.items,
						path_short: path[0],
						path_full: path[1],
						path_user: path[2]
					});
					document.title = title + ": /" + request_repo;
					val === true //no pushState when navigation via history cf. ReposForm.toCrossHistory
					&& (location.pathname.substring(1) != request_repo + huser)
					&& (hstate = history.state === null ? 1 : history.state.step + 1)
					&& history.pushState({ step: hstate }, request_repo + huser, "/" + request_repo + huser);
				}
				.bind(this),
				error: function (xhr, status, err) {
					console.error(api[0] + request_repo + api[1], status, err.toString());
					this.success({ total_count: 0, items: []});
			}	});
			return true;
		},

		render: function () {
			ReactDOM.unmountComponentAtNode(document.getElementById("contentRepo"));
			styles.loadingProgress(false).hidingRepos(false);
			return (
				<div>
					<ReposForm
						onFormSubmit={this.loadReposFromAPI}
						path_short={this.state.path_short}
						path_user={this.state.path_user} />
					<ReposList
						init={this.state.init}
						request={this.state.request}
						user={this.state.user}
						total_count={this.state.total_count}
						items={this.state.items}
						path_full={this.state.path_full} />
				</div>
	);	}   });


	var ReposForm = React.createClass({

		handleSubmit: function (e) {
			e.preventDefault();
			var repo = this.refs.repo.value.trim().split("/")[0];
			!! repo
			&& (this.refs.repo.value = repo)
			&& this.props.onFormSubmit(repo, true);
		},

		toCrossHistory: function () {
			var path = utilities.toGetPath();
			this.refs.repo.value = path[0];
			$user.val(path[2].substring(1));
			path[0] !== null
			&&	(	(	(history.state === null || hstate > history.state.step) //when history back from detailled result, return to initial result by css effect (toCloseRepoInfo)
						&& $(".close").length > 0
						&& (function () { $(".close").get(0).click(); return true })()
					)
					|| this.props.onFormSubmit(path[0], false)
					&& (hstate = history.state === null ? -1 : history.state.step)
				)
		},

		componentDidMount: function () {
			// if (this.isMounted)
			$user = $("#user");
			window.onpopstate = this.toCrossHistory; //to do: this event detection here?
			this.refs.repo.focus();
			this.props.path_short !== null
			&&	(	(this.refs.repo.value = this.props.path_short)
					&&	(	this.props.path_user !== null
							&& $user.val(this.props.path_user.substring(1))
						)
					|| true
				)
			&& this.props.onFormSubmit(this.props.path_short, false);
		},

		render: function () {
			return (
				<form onSubmit={this.handleSubmit} action="#" method="get">
					<input type="search" ref="repo" />
					<input type="submit" value="Chercher" />
					<input type="search" id="user" placeholder="(utilisateur en option)" />
				</form>
	);	}   });


	var ReposList = React.createClass({

		rawMarkup: function(string) {
			return { __html: marked(string.toString(), {sanitize: true}) };
		},

		render: function () {
			var len = this.props.items.length,
				request = this.props.request,
				user = this.props.user,
				path_full = this.props.path_full,

				reposNodes = len <= 0 ?

					<ReposDetail dname="" dclass="off" dapi="#" dgithub="#" path_full={path_full} /> :

					this.props.items.map(function (repo) {
						var r_api_title = "Dépôt '" + repo.full_name + "' : info sur les contributeurs et les commits",
							r_github_title = "Voir le dépôt '" + repo.full_name + "' sur Github (nouvelle fenêtre)",
							r_path = document.location.protocol + "//" + document.location.host + "/" + request + user + "/" + repo.full_name;
						return (
							<ReposDetail
								r_login={repo.owner.login}
								r_name={repo.name}
								r_class="on"
								r_api={repo.url}
								r_api_title={r_api_title}
								r_github={repo.html_url}
								r_github_title={r_github_title}
								path_full={path_full}
								r_path={r_path} />
					);	}),

				result = this.props.init == false ?

					"" :

					(len == 0 ? "Il n'y a aucun résultat dont le nom contienne le terme __" + this.props.request + "__" :
						len == this.props.total_count ?
							"*"
							+ len
							+ "* dépôt" + (len > 1 ? "s " : " ") + "dont le nom contient le terme __"
							+ this.props.request
							+ "__"
							:
							"*"
							+ len
							+ "* dépôts sur *"
							+ this.props.total_count
							+ "* dont le nom contient le terme __"
							+ this.props.request
							+ "__"
					)
					+ ((user = $user.val().trim()) ? " et l'utilisateur " + (len == 0 ? "soit __" : "est __") + user + "__": "")
					+ (len == 0 ? "" : " :");

			return (
				<div id="resultsRepos"  className="content">
					<div dangerouslySetInnerHTML={this.rawMarkup(result)} />
					<ol>
						{reposNodes}
					</ol>
				</div>
	);	}   });


	var ReposDetail = React.createClass({

		handleToGetDetails: function (e) {
			if (utilities.newnav)
				return;
			e.preventDefault();
			this.toGetDetails();
		},

		toGetDetails: function () {
			var prom = $.when(1); // empty promise
			styles.loadingProgress(true);
			prom = prom.then(function () {
				return $.ajax({
					url: api[2] + this.props.r_login + "/" + this.props.r_name + api[3] + token,
					dataType: "json",
					cache: false,
					error: function (xhr, status, err) {
						console.error(api[2] + request_repo + api[3], status, err.toString());
						styles.loadingProgress(false);
				}	})
			}.bind(this))
			.then(function (gotContrib) {
				return $.ajax({
					url: api[4] + this.props.r_login + "/" + this.props.r_name + api[5] + token,
					dataType: "json",
					cache: false,
					success: function (gotCommit) {
						ReactDOM.render(
							<RepoInfo
								r_name={this.props.r_name}
								r_login={this.props.r_login}
								gotContrib={gotContrib}
								gotCommit={gotCommit} />,
							document.getElementById("contentRepo")
					);	}
					.bind(this),
					error: function (xhr, status, err) {
						console.error(api[4] + request_repo + api[5], status, err.toString());
						styles.loadingProgress(false);
				}	})
			}.bind(this))
		},

		toFollowDeeper: function () {
			this.props.r_api
			&& this.props.path_full
			&& this.props.r_api.split(this.props.path_full)[0] == api[4]
			&& this.toGetDetails();
		},

		componentDidMount: function () {
			this.toFollowDeeper();
		},

		componentDidUpdate: function () {
			this.toFollowDeeper();
		},

		render: function() {
			return (
				<li className={this.props.dclass}>
					{this.props.r_login} : <a
						href={this.props.r_path}
						title={this.props.r_api_title}
						data-api={this.props.r_api}
						onClick={this.handleToGetDetails}
						target="_blank">
						{this.props.r_name}
					</a>
					<span className="more">
						(<a href={this.props.r_github} title={this.props.r_github_title} target="_blank">
							{""}
						</a>)
					</span>
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
				url: decodeURIComponent(location.pathname)
		};	},

		toCloseRepoInfo: function (e) {
			var path = utilities.toGetPath();
			e.preventDefault();
			ReactDOM.unmountComponentAtNode(document.getElementById("contentRepo"));
			styles.hidingRepos(false);
			this.setState({
				url: "/" + path[0]
			});
			document.title = title + ": /" + path[0];
			(	hstate != -1
				&&
				(	(	history.state === null //cf. toCrossHistory going back
						&& (hstate = -1)
					)
					||
					(	hstate > history.state.step //cf. toCrossHistory going back
						&& (hstate = history.state.step)
			)	)	)
			||
			(	(hstate = history.state === null ? 1 : history.state.step + 1)
				&& history.pushState({ step: hstate }, "/" + path[0], "/" + path[0] + path[2])
			)
		},

		render: function () {
			var path = utilities.toGetPath();
			styles.loadingProgress(false).hidingRepos(true);
			document.title = title + ": " + this.state.url.split("/")[1] + "/" + this.props.r_login + "/" + this.props.r_name;
			"/" + path[0] + path[2] + "/" + path[1] != this.state.url
			&& (hstate = history.state === null ? 1 : history.state.step + 1)
			&& history.pushState(
				{ step: hstate },
				this.props.r_name + " de " + this.props.r_login,
				this.state.url + "/" + this.props.r_login + "/" + this.props.r_name);
			return (
				<div>
					<a href="#" className="close" onClick={this.toCloseRepoInfo}>
						<span className="closeIcon">&#xF081;</span> Résultats initiaux <span className="closeIcon">&#xF081;</span>
					</a>
					<div className="clear">
						<hr />
					</div>
					<h2>
						Info sur le dépôt <strong>{this.props.r_name}</strong> de <strong>{this.props.r_login}</strong>
					</h2>
					<div className="clear">
						<RepoUser gotContrib={this.props.gotContrib} />
						<RepoCommit gotCommit={this.props.gotCommit} nbContrib={this.props.gotContrib.length} quoi={6} />
					</div>
					<div id="timeline">
					</div>
				</div>
	);	}	});


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
					repoUsers.length + " contributeurs :"; //to do: if single contributor

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

		/* this.setProps({}) in toCalculateCommitters() makes an error */
		repoCommittersG: null, //to do: how to communicate value inside object without state nor setProps (in ES6 no more valid)?

		toCalculateCommitters: function () {

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

			committers = number == this.props.nbContrib ? //to do: if single contributor, single commit
				"Sur les " + repoCommits.length + " derniers commits :" :
				"Dont " + number + " contributeurs sur les " + repoCommits.length + " derniers commits :";

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
				<Timeline gotCommit={this.props.gotCommit} list={this.repoCommittersG} />,
				document.getElementById("timeline")
		);	},

		render: function() {
			var commits = this.toCalculateCommitters();
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
			var presentation = this.props.commits == 1 ? " commits" : " commit";
			return (
				<li>
					{this.props.user} : {this.props.commits}
					{presentation}
				</li>
	);	}	});





/* ----------------------------------------------------------------------------------------------------------------------------------
	PART 3 : ONE REPO REQUEST TIMELINE */



	var Timeline = React.createClass({

		toDetermineContributors: function () {
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

		toCalculateDates: function () {
			return this.props.gotCommit.map(function (com) {
				return [new Date(com.commit.author.date), (com.author && com.author.login) || com.commit.author.name + " (an.)"];
			}).sort(function (a, b) {
				return a[0] - b[0];
		});	},

		render: function () {
			var slice = this.toDetermineContributors(),
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

				dates = this.toCalculateDates(),
				dlast = dates.length - 1,
				start = dates[0][0],
				startMs = start.getTime(),
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
//table "line": GRAPHICAL RENDERING date by date
				timelineLine,
//table "line" total: NUMERIC RENDERING date by date
				timelineTotal,

//table details: commits date by date for each contributor (short list)
				intoDetails = [],
//table details: to render footer like of table
				timelineDetails = [];



			for (var k in contributors) {
				typeof intoDetails[contributors[k]] === "undefined"
				&& (intoDetails[contributors[k]] = [0]); //to begin to initialise: each item is an array
			}




/* TABLE HEAD */

			intoHead[0][3] = intoHead[0][1].getTime(); //initialisations
			for (var i = 1; i < 50; ++i) { //initialisations
				intoHead[i] = [new Date(intoHead[i - 1][2] + slice), new Date(intoHead[i - 1][3] + slice)];
				intoHead[i][2] = intoHead[i][0].getTime();
				intoHead[i][3] = intoHead[i][1].getTime();
				intoLine[i] = 0; //to finish to initialise for 50 numerical entries
				for (var k in intoDetails) //to finish to initialise: each item is an array of 50 numerical entries
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




/* TABLE DETAILS */

			for (var k in intoDetails)
				timelineDetails.push(<TimelineTbodyDetails
					con={k}
					commitPerShortL={commitPerContribShortList}
					details={intoDetails[k]} />);



/* GLOBAL TABLE RENDER */

			return (
				<table>
					<caption title="Chronologie des derniers commits, à partir des plus anciens en premières colonnes,
						et avec détail des contributeurs les plus importants à partir de la troisième ligne du tableau">
						Chronologie des derniers commits<br /> entre le {utilities.toGetFullDate(start)} et le {utilities.toGetFullDate(end)}
					</caption>
					<thead>
						<tr>
							<td></td>
							{timelineHead}
						</tr>
					</thead>
					<tbody>
						<tr className="time">
							<td></td>
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
			var title = "Du " + utilities.toGetFullDate(this.props.date0) + " au " + utilities.toGetFullDate(this.props.date1),
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
				h = "h" + this.props.val; /* inline style on <strong makes error on ReactJS JSX */
			return (
				<td>
					<strong className={h} title={content}>{content}</strong>
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


