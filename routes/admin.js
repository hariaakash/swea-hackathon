var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var bcrypt = require('bcryptjs');
var cron = require('node-cron');
var helper = require('sendgrid').mail;
var sg = require('sendgrid')('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');
var Team = require('../models/team');
var Admin = require('../models/admin');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Creating Admin
bcrypt.hash('beingawesome', 10, function(err, hash) {
    Admin.findOne({
            name: 'hari'
        })
        .then(function(x) {
            if (x) {
                console.log('Admin already exists !!');
            } else {
                var admin = new Admin();
                admin.name = 'hari';
                admin.password = hash;
                admin.adminKey = hat();
                admin.admin = true;
                admin.save();
                console.log('Admin created !!');
            }
        });
});

cron.schedule('0 */12 * * *', function() {
    Admin.find({})
        .then(function(admin) {
            if (admin[0]) {
                for (i = 0; i < admin.length; i++) {
                    admin[i].adminKey = hat();
                    admin[i].save();
                }
            }
            console.log('Recreated Admin');
        });
});




// Admin Data GET
app.get('/', function(req, res) {
    if (req.query.adminKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.find({})
                        .then(function(teams) {
                            var data = {};
                            data.teams1 = [];
                            data.teams2 = [];
                            data.teams3 = [];
                            data.teams_count = teams.length;
                            data.participants = 0;
                            data.payment = {};
                            data.payment.up = 0;
                            data.payment.down = 0;
                            for (i = 0; i < teams.length; i++) {
                                data.participants += teams[i].user_count;
                                data.payment.up += teams[i].payment.up;
                                data.payment.down += teams[i].payment.down;
                                if (teams[i].payment.up == 0)
                                    data.teams1.push({
                                        teamId: teams[i].teamId,
                                        users: teams[i].users,
                                        payment: teams[i].payment,
                                        zone: teams[i].zone,
                                        user_count: teams[i].user_count,
                                        transaction: teams[i].transaction
                                    });
                                else if (teams[i].payment.up < teams[i].payment.down || teams[i].payment.up > teams[i].payment.down)
                                    data.teams2.push({
                                        teamId: teams[i].teamId,
                                        users: teams[i].users,
                                        payment: teams[i].payment,
                                        zone: teams[i].zone,
                                        user_count: teams[i].user_count,
                                        transaction: teams[i].transaction
                                    });
                                else
                                    data.teams3.push({
                                        teamId: teams[i].teamId,
                                        users: teams[i].users,
                                        payment: teams[i].payment,
                                        zone: teams[i].zone,
                                        user_count: teams[i].user_count,
                                        transaction: teams[i].transaction
                                    });
                            }
                            res.json({
                                status: true,
                                data: data
                            });
                        })
                        .catch(function(err) {
                            res.json({
                                status: false,
                                msg: 'Some error!!'
                            });
                        });
                } else {
                    res.json({
                        status: false,
                        msg: 'Account not found!'
                    })
                }
            })
            .catch(function(err) {
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

// Login
app.post('/login', function(req, res) {
    if (req.body.name && req.body.password) {
        Admin.findOne({
                name: req.body.name
            })
            .then(function(admin) {
                if (admin) {
                    bcrypt.compare(req.body.password, admin.password, function(err, resp) {
                        if (resp == true) {
                            res.json({
                                status: true,
                                msg: 'Successfully authenticated !!',
                                adminKey: admin.adminKey
                            });
                        } else {
                            res.json({
                                status: false,
                                msg: 'Password entered is wrong !'
                            })
                        }
                    });
                } else {
                    res.json({
                        status: false,
                        msg: 'Account not found !!'
                    })
                }
            })
            .catch(function(err) {
                res.json({
                    status: false,
                    msg: 'Some error occurred !!'
                });
            })
    } else {
        res.json({
            status: false,
            msg: 'Invalid Request'
        })
    }
});

app.post('/addAdmin', function(req, res) {
    if (req.body.adminKey && req.body.name && req.body.password && req.body.role) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    bcrypt.hash(req.body.password, 10, function(err, hash) {
                        var newAdmin = new Admin();
                        newAdmin.name = req.body.name;
                        newAdmin.password = hash;
                        newAdmin.adminKey = hat();
                        newAdmin.admin = req.body.role;
                        newAdmin.save();
                        res.json({
                            status: true,
                            msg: 'Admin created !'
                        })
                    });
                } else {
                    res.json({
                        status: false,
                        msg: 'Account not found !!'
                    })
                }
            })
            .catch(function(err) {
                res.json({
                    status: false,
                    msg: 'Some error occurred !!'
                });
            })
    } else {
        res.json({
            status: false,
            msg: 'Invalid Request'
        })
    }
});

// Admin Data GET
app.get('/email', function(req, res) {
    if (req.query.adminKey) {
        Admin.find({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.find({})
                        .then(function(teams) {
                            var data = [];
                            for (i = 0; i < teams.length; i++) {
                                for (j = 0; j < teams[i].users.length; j++)
                                    data.push(teams[i].users[j].hackerEarthId);
                            }
                            res.json({
                                status: true,
                                data: data
                            });
                        })
                        .catch(function(err) {
                            res.json({
                                status: false,
                                msg: 'Some error!!'
                            });
                        });
                } else {
                    res.json({
                        status: false,
                        msg: 'Account not found !!'
                    })
                }
            })
            .catch(function(err) {
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

// Admin Delete a Team
app.post('/deleteTeam', function(req, res) {
    if (req.body.adminKey && req.body.teamId) {
        Admin.find({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.findOne({
                            teamId: req.body.teamId
                        })
                        .then(function(team) {
                            if (team) {
                                team.remove();
                                team.save();
                                res.json({
                                    status: true,
                                    msg: 'Deleted Team with TeamId: ' + req.body.teamId
                                });
                            } else {
                                res.json({
                                    status: false,
                                    msg: 'Invalid Request'
                                });
                            }
                        })
                        .catch(function(err) {
                            res.json({
                                status: false,
                                msg: 'Some error!!'
                            });
                        });
                } else {
                    res.json({
                        status: false,
                        msg: 'Account not found !!'
                    })
                }
            })
            .catch(function(err) {
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

// Add/Reduce Payment
app.post('/paymentHandler', function(req, res) {
    if (req.body.adminKey && req.body.teamId && req.body.money) {
        Admin.find({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.findOne({
                            teamId: req.body.teamId
                        })
                        .then(function(team) {
                            if (team) {
                                team.payment.up += Number(req.body.money);
                                team.save();
                                res.json({
                                    status: true,
                                    msg: 'Successfully edited payment for team: ' + req.body.teamId
                                });
                            } else {
                                res.json({
                                    status: false,
                                    msg: 'Invalid Request'
                                });
                            }
                        })
                        .catch(function(err) {
                            res.json({
                                status: false,
                                msg: 'Some error!!'
                            });
                        });
                } else {
                    res.json({
                        status: false,
                        msg: 'Account not found !!'
                    })
                }
            })
            .catch(function(err) {
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

// Change Transaction Status
app.post('/changeTransactionStatus', function(req, res) {
    if (req.body.adminKey && req.body.teamId && req.body.tid && req.body.status) {
        Admin.find({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.findOne({
                            teamId: req.body.teamId
                        })
                        .then(function(team) {
                            if (team) {
                                for (i = 0; i < team.transaction.length; i++)
                                    if (team.transaction[i]._id == req.body.tid)
                                        team.transaction[i].status = req.body.status;
                                team.save();
                                res.json({
                                    status: true,
                                    msg: 'Successfully edited transaction status for team: ' + req.body.teamId
                                });
                            } else {
                                res.json({
                                    status: false,
                                    msg: 'Invalid Request'
                                });
                            }
                        })
                        .catch(function(err) {
                            res.json({
                                status: false,
                                msg: 'Some error!!'
                            });
                        });
                } else {
                    res.json({
                        status: false,
                        msg: 'Account not found !!'
                    })
                }
            })
            .catch(function(err) {
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

// Send Status
app.post('/sendStatus', function(req, res) {
    if (req.body.adminKey && req.body.teamId) {
        Admin.find({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.findOne({
                            teamId: req.body.teamId
                        })
                        .then(function(team) {
                            if (team) {
                                for (i = 0; i < team.users.length; i++) {
                                    var from = new helper.Email('support@sweassociation.in');
                                    var to = new helper.Email(team.users[i].hackerEarthId);
                                    var subject = 'Payment Status from CODE ENIGMA v2.0 Hackathon';
                                    var body = new helper.Content('text/html', 'Hello ' + team.users[i].name + ",<br> Login to our control panel for checking the status of your payment. <a href='http://sweassociation.in/CodeEnigma/teams/'>Click Here</a>");
                                    var mail = new helper.Mail(from, subject, to, body);
                                    var request = sg.emptyRequest({
                                        method: 'POST',
                                        path: '/v3/mail/send',
                                        body: mail.toJSON(),
                                    });
                                    sg.API(request);
                                }
                                res.json({
                                    status: true,
                                    msg: 'Status successfully sent !!'
                                });
                            } else {
                                res.json({
                                    status: false,
                                    msg: 'Invalid Request'
                                });
                            }
                        })
                        .catch(function(err) {
                            res.json({
                                status: false,
                                msg: 'Some error!!'
                            });
                        });
                } else {
                    res.json({
                        status: false,
                        msg: 'Account not found !!'
                    })
                }
            })
            .catch(function(err) {
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
