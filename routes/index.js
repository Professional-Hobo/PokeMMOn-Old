var express  = require('express');
var router   = express.Router();
var settings = require('../settings.json');

// Index //
router.get('/', function(req, res, next) {
    if (req.session.loggedin) {
        res.render('authenticated/home', { messages: req.flash('info') });
    } else {
        res.render('index', { messages: req.flash('info') });
    }
});

// Play //
router.get('/play', function(req, res, next) {
    if (req.session.loggedin) {
        res.render('authenticated/play', { messages: req.flash('info'), server: settings.general.domain + ":" + settings.game.port });
    } else {
        req.flash('info', "You must be logged in in order to access this resource.");
        res.redirect('/login');
    }
});

// Editor //
router.get('/editor', function(req, res, next) {
    //if (req.session.loggedin) {
    //    if (req.session.user.username == "keith") {
            res.render('editor/index', { messages: req.flash('info') });
    //    } else {
    //        req.flash('info', "You do not have the proper permissions to access this resource.");
    //        res.redirect('/');
    //    }
    //} else {
    //    req.flash('info', "You must be logged in in order to access this resource.");
    //    res.redirect('/login');
    //}
});

router.get('/editor2', function(req, res, next) {
    //if (req.session.loggedin) {
    //    if (req.session.user.username == "keith") {
            res.render('editor/new', { messages: req.flash('info') });
    //    } else {
    //        req.flash('info', "You do not have the proper permissions to access this resource.");
    //        res.redirect('/');
    //    }
    //} else {
    //    req.flash('info', "You must be logged in in order to access this resource.");
    //    res.redirect('/login');
    //}
});

// Login //
router.get('/login', function(req, res, next) {
    if (req.session.loggedin) {
        res.redirect('/');
    } else {
        res.render('login', { messages: req.flash('info') });
    }
});

router.post('/login', function(req, res, next) {
    if (req.session.loggedin) {
        res.redirect('/');
    } else {
        req.app.models.user.findOne({username: req.body.username}).exec(function(err, model) {
            if (err || !model) {
                req.flash('info', "Invalid username or password!");
                res.redirect('/login');
            } else if (model.validPass(req.body.password)) {
                req.session.loggedin = true;
                req.session.user = model;
                req.flash('info', "Logged in successfully! Welcome to PokeMMOn!");
                res.redirect('/');
            } else {
                req.flash('info', "Invalid username or password!");
                res.redirect('/login');
            }
        });
    }
});

// Logout //
router.get('/logout', function(req, res, next) {
    if (req.session.loggedin) {
        delete req.session.loggedin;
        req.flash('info', "Logged out successfully!");
        res.redirect('/');
    } else {
        res.redirect('/');
    }
});

// Registration //
router.get('/register', function(req, res, next) {
    if (req.session.loggedin) {
        res.redirect('/');
    } else {
        res.render('register', { messages: req.flash('info') });
    }
});

router.post('/register', function(req, res, next) {
    if (!req.session.loggedin) {
        req.app.models.user.create(req.body, function(err, model) {
            if(err) return res.json({ err: err }, 500);

            req.session.loggedin = true;
            req.session.user = model;
            req.flash('info', "Registered successfully! Welcome to PokeMMOn!");
            res.redirect('/');
        });
    }
});

module.exports = router;
