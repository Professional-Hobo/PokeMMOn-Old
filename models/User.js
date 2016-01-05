var mongoose = require('mongoose');

var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: String,
    role: {
        type: String,
        default: "user"
    },
    model: {
        type: String,
        default: "male_1"
    },
    zone: {
        type: String,
        default: "towny"
    },
    direction: {
        type: String,
        default: "down"
    },
    x: {
        type: Number,
        default: 37
    },
    y: {
        type: Number,
        default: 41
    }
});

userSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password);
    var models = ["male_1", "female_1"];
    this.model = models[Math.floor(Math.random() * models.length)];
    next();
});

userSchema.methods.validPass = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', userSchema);

module.exports = User;