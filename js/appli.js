var api = [
	"https://api.github.com/search/repositories?q=",
	"+in:name&type=Repositories&per_page=50",
	"https://api.github.com/repos/",
	"/contributors?per_page=100000",
	"https://api.github.com/repos/",
	"/commits?per_page=100"
];


var ContentBox = React.createClass({

	getInitialState: function () {
		"use strict";
		return {
			request: null,
			total_count: 0,
			items: [],
			len: -1,
			url: location.pathname != "/" ? decodeURIComponent(location.pathname.substring(1)) : null
	};	},

	loadReposFromAPI: function (q) {
		"use strict";
		var request_repo = q.split("/")[0];
		$.ajax({
			url: this.props.api0 + request_repo + this.props.api1 + token,
			dataType: "json",
			cache: false,
			success: function (data) {
				"use strict";
				this.setState({
					request: request_repo,
					total_count: data.total_count,
					items: data.items,
					len: data.items.length
				});
				(location.pathname.substring(1) != q)
				&& history.pushState({}, q, q);
			}.bind(this),
			error: function (xhr, status, err) {
				"use strict";
				console.error(this.props.api0 + request_repo + this.props.api1, status, err.toString());
			}.bind(this)
	});	},

	render: function () {
		"use strict";
		return (
			<div>
				<RepoForm
					onFormSubmit={this.loadReposFromAPI}
					url={this.state.url} />
				<RepoList
					request={this.state.request}
					total_count={this.state.total_count}
					items={this.state.items}
					len={this.state.len} />
			</div>
);	}   });


var RepoForm = React.createClass({

	handleSubmit: function (e) {
		"use strict";
		e.preventDefault();
		var repo = this.refs.repo.value.trim();
		!! repo
		&& this.props.onFormSubmit(repo);
	},

	popHistorySubmit: function () {
		"use strict";
		this.refs.repo.value = location.pathname.substring(1);
		location.pathname != "/"
		&& this.props.onFormSubmit(this.refs.repo.value);
	},

	componentDidMount: function () {
		"use strict";
		// if (this.isMounted)
		this.refs.repo.focus();
		window.onpopstate = this.popHistorySubmit;
		this.props.url !== null
		&& (this.refs.repo.value = this.props.url)
		&& this.props.onFormSubmit(this.props.url);
	},

	render: function () {
		"use strict";
		return (
			<form onSubmit={this.handleSubmit} action="#" method="get">
				<input type="search" ref="repo" />
				<input type="submit" value="Chercher" />
			</form>
);	}   });


var RepoList = React.createClass({

	rawMarkup: function(string) {
		"use strict";
		return { __html: marked(string.toString(), {sanitize: true}) };
	},

	toBiSort: function (n) { //-1 => 0 ; 0 => 0 ; n => 1
		"use strict";
		var x = Math.floor((n + 1) * (1 - 2 / 3));
		return Math.ceil(x / (x + 1));
	},

	toTriSort: function (n) { //-1 => 0 ; 0 => 1 ; n => 2
		"use strict";
		return Math.ceil(n / (n + 2)) + 1;
	},

	Repos: [
		function () {
			"use strict";
			return <RepoDetail dname="" dclass="off" dapi="#" dgithub="#" />;
		},
		function () {
			"use strict";
			return this.props.items.map(function (repo) {
				"use strict";
				var r_api_title = "Dépôt '" + repo.full_name + "' : info sur les contributeurs et les commits",
					r_github_title = "Voir le dépôt '" + repo.full_name + "' sur Github (nouvelle fenêtre)";
				return (
					<RepoDetail
						r_name={repo.full_name}
						r_class="on"
						r_api={repo.url}
						r_api_title={r_api_title}
						r_github={repo.html_url}
						r_github_title={r_github_title} />
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
			reposNodes = this.Repos[this.toBiSort(len)].bind(this)(),
			result = this.Results[this.toTriSort(len)].bind(this)();

		return (
			<div>
				<div dangerouslySetInnerHTML={this.rawMarkup(result)} />
				<ol>
					{reposNodes}
				</ol>
			</div>
);	}   });


var RepoDetail = React.createClass({

	toInform: function (e) {
		"use strict";
		e.preventDefault();
	},

	render: function() {
		"use strict";
		return (
			<li className={this.props.dclass}>
				<a href="#" title={this.props.r_api_title} data-api={this.props.r_api} onClick={this.toInform}>
					{this.props.r_name}
				</a>
				(<a href={this.props.r_github} title={this.props.r_github_title} target="_blank">
					{""}
				</a>)
			</li>
);	}	});


ReactDOM.render(
	<ContentBox api0={api[0]} api1={api[1]} />,
	document.getElementById("content")
);
/* to do: protéger (permet de multiples requêtes rapprochées sans erreur) */
var token = "&client_id=e8ce07d7ca81454ca7ca&client_secret=58e01a1e64bc997753cf364b80f53d922468722c";
