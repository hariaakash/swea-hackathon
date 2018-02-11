var port = 9000 || process.env.PORT;
var express = require('express');
var app = express();
var morgan = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
var team = require('./routes/team');
var admin = require('./routes/admin');


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/codeenigma', {
        useMongoClient: true
    })
    .then(function() {
        console.log('Connected to MONGOD !!');
    }).catch(function(err) {
        console.log('Failed to establish connection with MONGOD !!');
        console.log(err.message);
    });


app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cors());
app.use('/team', team);
app.use('/admin', admin);

app.get('/*', function(req, res) {
    res.send('404');
});


app.listen(port);
console.log('Server running on port: ' + port);
