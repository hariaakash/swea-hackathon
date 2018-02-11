var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var adminSchema = new Schema({
    name: String,
    password: String,
    admin: {
        type: Boolean,
        default: false
    },
    adminKey: String
});

module.exports = mongoose.model('Admin', adminSchema);
