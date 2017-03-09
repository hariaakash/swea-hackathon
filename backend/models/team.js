var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var teamSchema = new Schema({
	teamId: {
		type: String,
		unique: true
	},
	users: [{
		name: String,
		phone: Number,
		hackerEarthId: String
	}],
	payment: {
		up: Number,
		down: Number,
	},
	user_count: Number,
	zone: {
		university: String,
		state: String
	},
	authKey: String
});

module.exports = mongoose.model('Team', teamSchema);
