var mongoose = require('mongoose');

var serverSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    capacity: {
        type: Number
    }
});

var Server = mongoose.model('Server', serverSchema);

module.exports = Server;
