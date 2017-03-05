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
				team.zone.university = req.body.zone.university;
				team.zone.state = req.body.zone.state;
				team.users.push(req.body.user);
				team.user_count = 1;
				team.payment.up = 0;
				team.payment.down = 150;
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
					team.user_count+=1;
					team.payment.down+=150;
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


module.exports = app;
