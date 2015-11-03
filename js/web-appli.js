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

	Repos: [
		function (path_full) {
			"use strict";
			return <ReposDetail dname="" dclass="off" dapi="#" dgithub="#" path_full={path_full} />;
		},
		function (path_full) {
			"use strict";
			return this.props.items.map(function (repo) {
				"use strict";
				var r_api_title = "Dépôt '" + repo.full_name + "' : info sur les contributeurs et les commits",
					r_github_title = "Voir le dépôt '" + repo.full_name + "' sur Github (nouvelle fenêtre)";
				return (
					<ReposDetail
						r_login={repo.owner.login}
						r_name={repo.name}
						r_class="on"
						r_api={repo.url}
						r_api_title={r_api_title}
						r_github={repo.html_url}
						r_github_title={r_github_title}
						path_full={path_full} />
	);	});	}	],

	Results: [
		function () {
			"use strict";
			return "";
		},
		function () {
			"use strict";
			return "Il n'y a aucun résultat pour __"
				+ this.props.request
				+ "__";
		},
		function () {
			"use strict";
			return "*"
				+ this.props.len
				+ "* dépôts sur *"
				+ this.props.total_count
				+ "* dont le nom contient le terme __"
				+ this.props.request
				+ "__ :";
	}	],

	render: function () {
		"use strict";
		var len = this.props.len,
			reposNodes = this.Repos[utilities.toShuntBi(len)].bind(this)(this.props.path_full),
			result = this.Results[utilities.toShuntTri(len)].bind(this)();
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
						this.toDealResults(gotContrib, gotCommit);
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

	toDealResults: function (gotContrib, gotCommit) {
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
					href="#" title={this.props.r_api_title} data-api={this.props.r_api} onClick={this.handleToGetDetails}>
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
PART 2 : ONE REPO REQUEST */


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
		history.pushState({}, "/" + path[0], "/" + path[0]);
	},

	render: function () {
		"use strict";
		var path = utilities.toGetPath();
		styles.loadingProgress(false).hidingRepos(true);
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
					<RepoUserInfo gotContrib={this.props.gotContrib} />
					<RepoCommitInfo gotCommit={this.props.gotCommit} nbContrib={this.props.gotContrib.length} quoi={6} />
				</div>
				<div id="timeline">
				</div>
			</div>
);	}	});


var RepoUserInfo = React.createClass({

	render: function() {
		"use strict";
		var repoUsers = this.props.gotContrib.map(function (user) {
			"use strict";
			var contributor = user.type == "Anonymous" ?
				user.name + " (anonyme)" : //anonymous
				user.login;
			return (
				<RepoUser login={contributor} />
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


var RepoUser = React.createClass({

	render: function () {
		"use strict";
		return (
			<li>
				{this.props.login}
			</li>
);	}	});


var RepoCommitInfo = React.createClass({

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

		repoCommits.forEach(function (user) {
			"use strict";
			users[user] ? ++ users[user] : users[user] = 1;
		});

		for (var k in users) {
			++ number;
			usersSorted[users[k]] ?
				usersSorted[users[k]][0].push(k) :
				usersSorted[users[k]] = [[k], users[k]];
		}

		users = [];

		committers = number == this.props.nbContrib ? //to do: if single contributor, single commit
			"Sur les " + repoCommits.length + " derniers commits :" :
			"Dont " + number + " contributeurs sur les " + repoCommits.length + " derniers commits :";

		repoCommitters = usersSorted.reverse().map(function (user) {
			"use strict";
			user[0].sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
			users.push(user);
			return user[0].map(function (u) {
				"use strict";
				return (
					<RepoCommit user={u} commits={user[1]} />
		);	});	});

		this.repoCommittersG = users;

		return [committers, repoCommitters];
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


var RepoCommit = React.createClass({

	render: function () {
		"use strict";
		var presentation = [" : ", " commits", " commit"];
		return (
			<li>
				{this.props.user}
				{presentation[0]}
				{this.props.commits}
				{presentation[utilities.toShuntBi12N1(this.props.commits)]}
			</li>
);	}	});


var Timeline = React.createClass({

	toFixContributor: [
		function () { //less than 5 commits, return "divers"
			"use strict";
			return "divers";
		},
		function (con) { //more than 4 commits, return contributor name
			"use strict";
			return con;
	}	],

	toDetermineContributors: function () {
		"use strict";
		var contributors = [],
			commitPerContribShortList = [];
		this.props.list.forEach(function (cont) {
			"use strict";
			cont[0].forEach(function (con) {
				"use strict";
				contributors[con] = this.toFixContributor[cont[1] < 5 ? 0 : 1].bind(this)(con);
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
			return [new Date(com.commit.author.date), (com.author && com.author.login) || com.commit.author.name + " (an)"];
		}).sort(function (a, b) {
			"use strict";
			return a[0] - b[0];
	});	},

	render: function () {
		"use strict";
		var slice = this.toDetermineContributors(),
			contributors = slice[0],
			commitPerContribShortList = slice[1],

			dates = this.toCalculateDates(),
			dlast = dates.length - 1,
			start = dates[0][0],
			startMs = start.getTime(),
			end = dates[dlast][0],
			duration = (end - start),
			slice = duration / 50,

			intoHead = [[start, new Date(startMs + slice), startMs]],
			timelineHead,
			intoLine = [0],
			timelineLine,
			timelineTotal,
			intoDetails = [],
			timelineDetails = [];



		for (var k in contributors) {
			! intoDetails[contributors[k]]
			&& (intoDetails[contributors[k]] = [0]); //short list of contributors
		}


/* table head */

		intoHead[0][3] = intoHead[0][1].getTime();
		for (var i = 1; i < 50; ++i) {
			intoHead[i] = [new Date(intoHead[i - 1][2] + slice), new Date(intoHead[i - 1][3] + slice)];
			intoHead[i][2] = intoHead[i][0].getTime();
			intoHead[i][3] = intoHead[i][1].getTime();
			intoLine[i] = 0;
			for (var k in intoDetails)
				intoDetails[k][i] = 0;
		}

		timelineHead = intoHead.map(function (date, index) {
			"use strict";
			return <TimelineThead date0={date[0]} date1={date[1]} index={index + 1} />
		});


/* table datas */

		dates.forEach(function (d, index) {
			"use strict";
			var item = Math.floor((d[0].getTime() - startMs - /* for last item */ Math.floor(index / dlast)) / slice);
			intoLine[item] ++;

			typeof contributors[d[1]] !== "undefined"
			&& intoDetails[contributors[d[1]]][item] ++;
		});

		timelineLine = intoLine.map(function (val) {
			"use strict";
			return <TimelineTbodyLine val={val} />
		});

		timelineTotal = intoLine.map(function (val) {
			"use strict";
			return <TimelineTbodyTotal val={val} />
		});


/* table details */

		for (var k in intoDetails)
			timelineDetails.push(<TimelineTbodyDetails
				con={k}
				commitPerShortL={commitPerContribShortList}
				details={intoDetails[k]} />);


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

