/* Web appli to search repo with Github API
Gaëtan Langhade, Interfacteur
novembre 2015 */





/* ----------------------------------------------------------------------------------------------------------------------------------
PART 1 : ALL REPOS REQUEST */



var ContentBox = React.createClass({

	getInitialState: function () {
		"use strict";
		var path = utilities.toGetPath();
		return {
			request: null,
			total_count: 0,
			items: [],
			len: -1,
			path_short: path[0],
			path_full: path[1]
	};	},

	loadReposFromAPI: function (q, val) {
		"use strict";
		var request_repo = q.split("/")[0],
			path = utilities.toGetPath();
		styles.loadingProgress(true);
		$.ajax({
			url: api[0] + request_repo + api[1] + token,
			dataType: "json",
			cache: false,
			success: function (got) {
				"use strict";
				this.setState({
					request: request_repo,
					total_count: got.total_count,
					items: got.items,
					len: got.items.length,
					path_short: path[0],
					path_full: path[1]
				});
				document.title = title + ": /" + request_repo;
				! val //when navigation via history cf. ReposForm.toCrossHistory
				&& (location.pathname.substring(1) != request_repo)
				&& history.pushState({}, request_repo, "/" + request_repo);
			}.bind(this),
			error: function (xhr, status, err) {
				"use strict";
				console.error(api[0] + request_repo + api[1], status, err.toString());
				styles.loadingProgress(false);
			}.bind(this)
	});	},

	render: function () {
		"use strict";
		ReactDOM.unmountComponentAtNode(document.getElementById("contentRepo"));
		styles.loadingProgress(false).hidingRepos(false);
		return (
			<div>
				<ReposForm
					onFormSubmit={this.loadReposFromAPI}
					path_short={this.state.path_short} />
				<ReposList
					request={this.state.request}
					total_count={this.state.total_count}
					items={this.state.items}
					len={this.state.len}
					path_full={this.state.path_full} />
			</div>
);	}   });


var ReposForm = React.createClass({

	handleSubmit: function (e) {
		"use strict";
		e.preventDefault();
		var repo = this.refs.repo.value.trim().split("/")[0];
		!! repo
		&& (this.refs.repo.value = repo)
		&& this.props.onFormSubmit(repo);
	},

	toCrossHistory: function () {
		"use strict";
		var path = utilities.toGetPath();
		this.refs.repo.value = path[0];
		path[0] != "/"
		&& this.props.onFormSubmit(path[0], true);
	},

	componentDidMount: function () {
		"use strict";
		// if (this.isMounted)
		window.onpopstate = this.toCrossHistory;
		this.refs.repo.focus();
		this.props.path_short !== null
		&& (this.refs.repo.value = this.props.path_short)
		&& this.props.onFormSubmit(this.props.path_short);
	},

	render: function () {
		"use strict";
		return (
			<form onSubmit={this.handleSubmit} action="#" method="get">
				<input type="search" ref="repo" />
				<input type="submit" value="Chercher" />
			</form>
);	}   });


var ReposList = React.createClass({

	rawMarkup: function(string) {
		"use strict";
		return { __html: marked(string.toString(), {sanitize: true}) };
	},

	render: function () {
		"use strict";
		var len = this.props.len,
			request = this.props.request,
			path_full = this.props.path_full,

			reposNodes = len <= 0 ?

				<ReposDetail dname="" dclass="off" dapi="#" dgithub="#" path_full={path_full} /> :

				this.props.items.map(function (repo) {
					"use strict";
					var r_api_title = "Dépôt '" + repo.full_name + "' : info sur les contributeurs et les commits",
						r_github_title = "Voir le dépôt '" + repo.full_name + "' sur Github (nouvelle fenêtre)",
						r_path = document.location.protocol + "//" + document.location.host + "/" + request + "/" + repo.full_name;
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

			result = len == -1 ?

				"" :

				(len == 1 ? "Il n'y a aucun résultat pour __" + this.props.request + "__" :
					"*"
					+ this.props.len
					+ "* dépôts sur *"
					+ this.props.total_count
					+ "* dont le nom contient le terme __"
					+ this.props.request
					+ "__ :"
				);

		return (
			<div id="resultsRepos">
				<div dangerouslySetInnerHTML={this.rawMarkup(result)} />
				<ol>
					{reposNodes}
				</ol>
			</div>
);	}   });


var ReposDetail = React.createClass({

	handleToGetDetails: function (e) {
		"use strict";
		if (utilities.newnav)
			return;
		e.preventDefault();
		this.toGetDetails();
	},

	toGetDetails: function () {
		"use strict";
		styles.loadingProgress(true);
		$.ajax({
			url: api[2] + this.props.r_login + "/" + this.props.r_name + api[3] + token,
			dataType: "json",
			cache: false,
			success: function (gotContrib) {
				"use strict";
				$.ajax({
					url: api[4] + this.props.r_login + "/" + this.props.r_name + api[5] + token,
					dataType: "json",
					cache: false,
					success: function (gotCommit) {
						"use strict";
						this.toDealResultsFromAjax(gotContrib, gotCommit);
					}.bind(this),
					error: function (xhr, status, err) {
						"use strict";
						console.error(api[4] + request_repo + api[5], status, err.toString());
						styles.loadingProgress(false);
					}.bind(this)
			})	}.bind(this),
			error: function (xhr, status, err) {
				"use strict";
				console.error(api[2] + request_repo + api[3], status, err.toString());
				styles.loadingProgress(false);
			}.bind(this)
	})	},

	toDealResultsFromAjax: function (gotContrib, gotCommit) {
		"use strict";
		ReactDOM.render(
			<RepoInfo
				r_name={this.props.r_name}
				r_login={this.props.r_login}
				gotContrib={gotContrib}
				gotCommit={gotCommit} />,
			document.getElementById("contentRepo")
	);	},

	toFollowDeeper: function () {
		"use strict";
		this.props.r_api
		&& this.props.path_full
		&& this.props.r_api.split(this.props.path_full)[0] == api[4]
		&& this.toGetDetails();
	},

	componentDidMount: function () {
		"use strict";
		this.toFollowDeeper();
	},

	componentDidUpdate: function () {
		"use strict";
		this.toFollowDeeper();
	},

	render: function() {
		"use strict";
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
		"use strict";
		return {
			url: decodeURIComponent(location.pathname)
	};	},

	toCloseRepoInfo: function (e) {
		"use strict"
		var path = utilities.toGetPath();
		e.preventDefault();
		ReactDOM.unmountComponentAtNode(document.getElementById("contentRepo"));
		styles.hidingRepos(false);
		this.setState({
			url: "/" + path[0]
		});
		document.title = title + ": /" + path[0];
		history.pushState({}, "/" + path[0], "/" + path[0]);
	},

	render: function () {
		"use strict";
		var path = utilities.toGetPath();
		styles.loadingProgress(false).hidingRepos(true);
		document.title = title + ": " + this.state.url.split("/")[1] + "/" + this.props.r_login + "/" + this.props.r_name;
		"/" + path[0] + "/" + path[1] != this.state.url
		&& history.pushState(
			{},
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
		"use strict";
		var repoUsers = this.props.gotContrib.map(function (user) {
			"use strict";
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
		"use strict";
		return (
			<li>
				{this.props.login}
			</li>
);	}	});


var RepoCommit = React.createClass({ //from commits JSON

	/* this.setProps({}) in toCalculateCommitters() makes an error */
	repoCommittersG: null, //to do: how to communicate value inside object without state nor setProps (in ES6 no more valid)?

	toCalculateCommitters: function () {
		"use strict";

		var users = [],
			usersSorted = [],
			number = 0,
			committers,
			repoCommitters,
			repoCommits;

		repoCommits = this.props.gotCommit.map(function (user) {
			"use strict";
			return user.author ?
				user.author.login :
				user.commit.author.name + " (an.)"; //anonymous
		}).sort();
/* console.log(repoCommits)
	["LRotherfield", "LRotherfield", "LRotherfield", "Luke Rotherfield (an.)", "Luke Rotherfield (an.)",
	"Luke Rotherfield (an.)", "root (an.)", "root (an.)", "sebastien-roch", "sgilberg"] */

		repoCommits.forEach(function (user) { //remove duplicates
			"use strict";
			users[user] ? ++ users[user] : users[user] = 1;
		});
/* console.log(users)
	LRotherfield 	3
	Luke Rotherfield (an.)	3
	root (an.)	2
	sebastien-roch 	1
	sgilberg 	1 */

		for (var k in users) {
			++ number;
			typeof usersSorted[users[k]] !== "undefined" ?
				usersSorted[users[k]][0].push(k) :
				usersSorted[users[k]] = [[k], users[k]];
		}
/* console.log(usersSorted)
	[undefined, [["sebastien-roch", "sgilberg"], 1], [["root (an.)"], 2], [["LRotherfield", "Luke Rotherfield (an.)"], 3]] */

		users = [];

		committers = number == this.props.nbContrib ? //to do: if single contributor, single commit
			"Sur les " + repoCommits.length + " derniers commits :" :
			"Dont " + number + " contributeurs sur les " + repoCommits.length + " derniers commits :";

		repoCommitters = usersSorted.reverse().map(function (user) {
			"use strict";
			/* console.log(user)
				[["LRotherfield", "Luke Rotherfield (an.)"], 3] */
			user[0].sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
			users.push(user);
			return user[0].map(function (u) {
				"use strict";
				return (
					<RepoCommitInfo user={u} commits={user[1]} />
		);	});	});
/* console.log(users)
	[[["LRotherfield", "Luke Rotherfield (an.)"], 3], [["root (an.)"], 2], [["sebastien-roch", "sgilberg"], 1]] */

		this.repoCommittersG = users; //for timeline

		return [committers, repoCommitters]; //for render function
	},

	componentDidMount: function() {
		"use strict";
		ReactDOM.render(
			<Timeline gotCommit={this.props.gotCommit} list={this.repoCommittersG} />,
			document.getElementById("timeline")
	);	},

	render: function() {
		"use strict";
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
		"use strict";
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
		"use strict";
		var contributors = [],
			commitPerContribShortList = [];
		this.props.list.forEach(function (cont) {
			"use strict";
			cont[0].forEach(function (con) {
				"use strict";
				contributors[con] = cont[1] < 5 ? "= divers" : con; //less than 5 commits, return "divers" else return contributor name
				typeof commitPerContribShortList[contributors[con]] === "undefined"
				&& (commitPerContribShortList[contributors[con]] = cont[1])
				|| (commitPerContribShortList[contributors[con]] += cont[1]);
			}.bind(this));
		}.bind(this));
		return [contributors, commitPerContribShortList];
	},

	toCalculateDates: function () {
		"use strict";
		return this.props.gotCommit.map(function (com) {
			"use strict";
			return [new Date(com.commit.author.date), (com.author && com.author.login) || com.commit.author.name + " (an.)"];
		}).sort(function (a, b) {
			"use strict";
			return a[0] - b[0];
	});	},

	render: function () {
		"use strict";
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
			"use strict";
			return <TimelineThead date0={date[0]} date1={date[1]} index={index + 1} />
		});




/* TABLE "LINE" */

		dates.forEach(function (d, index) { //commits count
/*
to count commits by date
and to count commits for each contributor (short liste) by date
*/
			"use strict";
			var item = Math.floor((d[0].getTime() - startMs - /* for last item */ Math.floor(index / dlast)) / slice);
			intoLine[item] ++; //to count commits
			typeof contributors[d[1]] !== "undefined"
			&& intoDetails[contributors[d[1]]][item] ++; //to count commits / contr.
		});

		timelineLine = intoLine.map(function (val) { //visual rendering
			"use strict";
			return <TimelineTbodyLine val={val} />
		});

		timelineTotal = intoLine.map(function (val) { //numerical rendering
			"use strict";
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
		"use strict";
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
		"use strict";
		var content = this.props.val == 0 ? "" : this.props.val + " commits",
			h = "h" + this.props.val; /* inline style on <strong makes error on ReactJS JSX */
		return (
			<td>
				<strong className={h} title={content}>{content}</strong>
			</td>
);	}	});


var TimelineTbodyTotal = React.createClass({

	render: function () {
		"use strict";
		var content = this.props.val == 0 ? "" : this.props.val;
		return (
			<td>
				{content}
			</td>
);	}	});


var TimelineTbodyDetails = React.createClass({

	render: function () {
		"use strict";
		var timelineDetailsCell = this.props.details.map(function (val) {
			"use strict";
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
		"use strict";
		var v = this.props.val > 0 ? this.props.val : "";
		return (
			<td>{v}</td>
);	}	});

