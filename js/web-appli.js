/* ----------------------------------------------------------------------------------------------------------------------------------
PART 1 : ALL REPOS REQUEST */


var ContentBox = React.createClass({

	getInitialState: function () {
		"use strict";
		var path = toGetPath();
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
			path = toGetPath();
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
		var path = toGetPath();
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

	toBiSort: function (n) { //-1 => 0 ; 0 => 0 ; n => 1
		"use strict";
		var x = Math.floor((n + 1) * 2 / 3);
		return Math.ceil(x / (x + 1));
	},

	toTriSort: function (n) { //-1 => 0 ; 0 => 1 ; n => 2
		"use strict";
		return Math.ceil(n / (n + 2)) + 1;
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
			reposNodes = this.Repos[this.toBiSort(len)].bind(this)(this.props.path_full),
			result = this.Results[this.toTriSort(len)].bind(this)();
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
		var path = toGetPath();
		console.log(path)
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
		var path = toGetPath();
		styles.loadingProgress(false).hidingRepos(true);
		"/" + path[0] + "/" + path[1] != this.state.url
		&& history.pushState(
			{},
			this.props.r_name + " de " + this.props.r_login,
			this.state.url + "/" + this.props.r_login + "/" + this.props.r_name);
		return (
			<div>
				<a href="#" className="close" onClick={this.toCloseRepoInfo}>
					Résultats initiaux <span className="closeIcon">&#xF081;</span>
				</a>
				<div className="clear">
					<hr />
				</div>
				<h2>
					Info sur le dépôt <strong>{this.props.r_name}</strong> de <strong>{this.props.r_login}</strong>
				</h2>
				<div className="clear">
					<RepoUserInfo gotContrib={this.props.gotContrib} />
					<RepoCommitInfo gotCommit={this.props.gotCommit} nbContrib={this.props.gotContrib.length} />
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
				repoUsers.length + " contributeurs :";

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

	render: function() {
		"use strict";
		var repoCommits = this.props.gotCommit.map(function (user) {
			"use strict";
			return user.author ?
				user.author.login :
				user.commit.author.name + " (an.)"; //anonymous
		}).sort(),
			users = [],
			usersSorted = [],
			number = 0,
			committers,
			repoCommitters;

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

		committers = number == this.props.nbContrib ?
			"Sur les " + repoCommits.length + " derniers commits :" :
			"Dont " + number + " contributeurs sur les " + repoCommits.length + " derniers commits :";

		repoCommitters = usersSorted.reverse().map(function (user) {
			"use strict";
			user[0].sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
			return user[0].map(function (u) {
				"use strict";
				return (
					<RepoCommit user={u} commits={user[1]} />
		);	});	});

		return (
			<div className="right">
				<h3>
					{committers}
				</h3>
				<ol className="users">
					{repoCommitters}
				</ol>
			</div>
);	}	});


var RepoCommit = React.createClass({

	toBiSort12N1: function (n) { //1 => 2 ; n => 1
		"use strict";
		return Math.floor(n / (n * n)) + 1;
	},

	render: function () {
		"use strict";
		var presentation = [" : ", " commits", " commit"]
		return (
			<li>
				{this.props.user}
				{presentation[0]}
				{this.props.commits}
				{presentation[this.toBiSort12N1(this.props.commits)]}
			</li>
);	}	});


