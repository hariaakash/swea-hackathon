var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var cron = require('node-cron');
var helper = require('sendgrid').mail;
var sg = require('sendgrid')('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');
var Team = require('../models/team');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

cron.schedule('0 */12 * * *', function() {
    Team.find({})
        .then(function(team) {
            if (team[0]) {
                for (i = 0; i < team.length; i++) {
                    team[i].authKey = hat();
                    team[i].save();
                }
            }
            console.log('Recreated');
        });
});


// Get Team Data
app.get('/', function(req, res) {
    if (req.query.authKey) {
        Team.findOne({
                authKey: req.query.authKey
            })
            .then(function(team) {
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
            .catch(function(err) {
                res.json({
                    status: false,
                    msg: 'Some error occurred !!'
                });
            });
    } else {
        res.json({
            status: false,
            msg: 'Empty request !!'
        });
    }
});

// Register Team
app.post('/register', function(req, res) {
    if (req.body.teamId && req.body.zone && req.body.user) {
        Team.findOne({
                teamId: req.body.teamId
            })
            .then(function(teams) {
                if (!teams) {
                    var team = new Team();
                    team.teamId = req.body.teamId;
                    team.zone = req.body.zone;
                    team.user_count = 1;
                    team.payment.up = 0;
                    team.payment.down = 200;
                    team.users.push(req.body.user);
                    team.save()
                        .then(function(team) {
                            res.json({
                                status: true,
                                msg: 'Successfully Registered!!'
                            });
                        })
                        .catch(function(err) {
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
            .catch(function(err) {
                res.json({
                    status: false,
                    msg: 'Some error occurred !!'
                });
            });
    } else {
        res.json({
            status: false,
            msg: 'Empty request !!'
        });
    }
});

// Authenticate
app.post('/login', function(req, res) {
    if (req.body.teamId && req.body.phone) {
        Team.findOne({
                teamId: req.body.teamId
            })
            .then(function(team) {
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
            .catch(function(err) {
                res.json({
                    status: false,
                    msg: 'Some error occurred !!'
                });
            });
    } else {
        res.json({
            status: false,
            msg: 'Empty request !!'
        });
    }
});

// Add a team member
app.post('/addMember', function(req, res) {
    if (req.body.teamId && req.body.authKey) {
        Team.findOne({
                teamId: req.body.teamId,
                authKey: req.body.authKey
            })
            .then(function(team) {
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
                        team.payment.down += 200;
                        team.save();
                        res.json({
                            status: true,
                            msg: 'Successfully added team member: ' + req.body.user.name
                        });
                    } else
                        res.json({
                            status: false,
                            msg: 'Email / mobile phone is already registered'
                        });
                } else
                    res.json({
                        status: false,
                        msg: 'Invalid Request'
                    });
            })
            .catch(function(err) {
                res.json({
                    status: false,
                    msg: 'Some error occurred !!'
                });
            });
    } else {
        res.json({
            status: false,
            msg: 'Empty request !!'
        });
    }
});

// Edit Team Member
app.post('/editMember', function(req, res) {
    if (req.body.teamId && req.body.authKey && req.body.user) {
        Team.findOne({
                teamId: req.body.teamId,
                authKey: req.body.authKey
            })
            .then(function(team) {
                if (team) {
                    for (var i = 0; i < team.users.length; i++)
                        if (team.users[i]._id == req.body.user._id) {
                            team.users[i].name = req.body.user.name;
                            team.users[i].phone = req.body.user.phone;
                            team.users[i].hackerEarthId = req.body.user.hackerEarthId;
                            break;
                        }
                    team.save();
                    res.json({
                        status: true,
                        msg: 'Successfully edited team member: ' + req.body.user.name
                    });
                } else
                    res.json({
                        status: false,
                        msg: 'Invalid Request'
                    });
            })
            .catch(function(err) {
                res.json({
                    status: false,
                    msg: 'Some error occurred !!'
                });
            });
    } else {
        res.json({
            status: false,
            msg: 'Empty request !!'
        });
    }
});

// Add Transaction - Request
app.post('/addTransaction', function(req, res) {
    if (req.body.teamId && req.body.authKey) {
        Team.findOne({
                teamId: req.body.teamId,
                authKey: req.body.authKey
            })
            .then(function(team) {
                if (team) {
                    team.transaction.push({
                        tid: req.body.tid,
                        number: req.body.phone,
                        status: false
                    });
                    team.save();
                    res.json({
                        status: true,
                        msg: 'Payment Verification request successfully sent!!'
                    });
                } else
                    res.json({
                        status: false,
                        msg: 'Invalid Request'
                    });
            })
            .catch(function(err) {
                res.json({
                    status: false,
                    msg: 'Some error occurred !!'
                });
            });
    } else {
        res.json({
            status: false,
            msg: 'Empty request !!'
        });
    }
});

module.exports = app;
