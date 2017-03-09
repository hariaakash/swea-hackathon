var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var Team = require('../models/team');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


// Get Team Data
app.get('/', function (req, res) {
	Team.findOne({
			authKey: req.query.authKey
		})
		.then(function (team) {
			if (team)
				res.json({
					status: true,
					team: team
				});
			else
				res.json({
					status: false,
					msg: 'Invalid Request'
				});
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: err
			});
		});
});

// Register Team
app.post('/register', function (req, res) {
	Team.findOne({
			teamId: req.body.teamId
		})
		.then(function (teams) {
			console.log(req.body);
			if (!teams) {
				var team = new Team();
				team.teamId = req.body.teamId;
				team.zone = req.body.zone;
				team.user_count = 1;
				team.payment.up = 0;
				team.payment.down = 150;
				team.users.push(req.body.user);
				team.save()
					.then(function (team) {
						res.json({
							status: true,
							msg: 'Successfully Registered!!'
						});
					})
					.catch(function (err) {
						res.json({
							status: false,
							msg: err
						});
					});
			} else
				res.json({
					status: false,
					msg: 'TeamId already exists'
				});
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: err
			});
		});
});

// Authenticate
app.post('/login', function (req, res) {
	Team.findOne({
			teamId: req.body.teamId
		})
		.then(function (team) {
			if (team) {
				var f = 0;
				for (var i = 0; i < team.users.length; i++) {
					if (team.users[i].phone == req.body.phone) {
						f++;
					}
				}
				if (f > 0) {
					team.authKey = hat();
					team.save();
					res.json({
						status: true,
						authKey: team.authKey,
						msg: 'Successfully logged in !!'
					});
				} else {
					res.json({
						status: false,
						msg: 'Phone Number not registered'
					})
				}
			} else
				res.json({
					status: false,
					msg: 'Invalid TeamId'
				});
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: err
			});
		});
});


app.post('/addMember', function (req, res) {
	Team.findOne({
			teamId: req.body.teamId,
			authKey: req.body.authKey
		})
		.then(function (team) {
			if (team) {
				var p = 0,
					h = 0;
				for (var i = 0; i < team.users.length; i++) {
					if (team.users[i].phone == req.body.user.phone) {
						p++;
					}
					if (team.users[i].hackerEarthId == req.body.user.hackerEarthId) {
						h++;
					}
				}
				if (p == 0 && h == 0) {
					team.users.push(req.body.user);
					team.user_count += 1;
					team.payment.down += 150;
					team.save();
					res.json({
						status: true,
						msg: 'Successfully added team member: ' + req.body.user.name
					});
				} else
					res.json({
						status: false,
						msg: 'Hackerearth username / mobile phone is already registered'
					});
			} else
				res.json({
					status: false,
					msg: 'Invalid Request'
				});
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: err
			});
		});
});

// Authenticate Admin
app.post('/adminLogin', function (req, res) {
	if (req.body) {
		if (req.body.uname == 'sweasrm' && req.body.pass == 'SWEAsrm@987')
			res.json({
				status: true,
				adminKey: '7418571f6d814abda162f4b223f786c2',
				msg: 'Successfully logged in !!'
			});
		else
			res.json({
				status: false,
				msg: 'Invalid username / password'
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid Request'
		})
	}
});

// Admin Data GET
app.get('/adminGet', function (req, res) {
	if (req.query.adminKey == '7418571f6d814abda162f4b223f786c2') {
		Team.find({})
			.then(function (teams) {
				var data = {};
				data.teams = [];
				data.teams_count = teams.length;
				data.participants = 0;
				data.payment = {};
				data.payment.up = 0;
				data.payment.down = 0;
				for (i = 0; i < teams.length; i++) {
					data.participants += teams[i].user_count;
					data.payment.up += teams[i].payment.up;
					data.payment.down += teams[i].payment.down;
					data.teams.push({
						teamId: teams[i].teamId,
						users: teams[i].users,
						payment: teams[i].payment,
						user_count: teams[i].user_count,
					});
				}
				res.json({
					status: true,
					data: data
				});
			})
			.catch(function (err) {
				console.log(err);
				res.json({
					status: false,
					msg: 'Some error!!'
				});
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid Request'
		});
	}
});


module.exports = app;
