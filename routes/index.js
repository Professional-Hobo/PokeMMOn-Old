var express  = require('express');
var router   = express.Router();
var settings = require('../settings.json');
var Tile     = require('../public/js/editor/Tile.js');
var User     = require('../models/User.js');

var baseURL;
router.get('*', function(req, res,next) {
    if (settings.behindReverseProxy) {
        var uri = req.headers.uri;
        var path = req.originalUrl;
        baseURL = uri.slice(0, uri.indexOf(path));
    } else {
        baseURL = "";
    }
    next();
});

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
        res.render('authenticated/play', { messages: req.flash('info'), server: ":" + settings.game.port });
    } else {
        req.flash('info', "You must be logged in in order to access this resource.");
        res.redirect(baseURL + '/login');
    }
});

// Login //
router.get('/login', function(req, res, next) {
    if (req.session.loggedin) {
        res.redirect(baseURL + '/');
    } else {
        res.render('login', { messages: req.flash('info') });
    }
});

router.post('/login', function(req, res, next) {
    if (req.session.loggedin) {
        res.redirect(baseURL + '/');
    } else {
        User.findOne({username: req.body.username}, function(err, model) {
            if (err || !model) {
                req.flash('info', "Invalid username or password!");
                res.redirect(baseURL + '/login');
            } else {
                model.validPass(req.body.password, function(err, match) {
                    if (match) {
                        req.session.loggedin = true;
                        req.session.user = model;
                        req.flash('info', "Logged in successfully! Welcome to PokeMMOn!");
                        res.redirect(baseURL + '/');
                    } else {
                        req.flash('info', "Invalid username or password!");
                        res.redirect(baseURL + '/login');
                    }
                });
            }
        });
    }
});

// Logout //
router.get('/logout', function(req, res, next) {
    if (req.session.loggedin) {
        delete req.session.loggedin;
        req.flash('info', "Logged out successfully!");
        res.redirect(baseURL + '/');
    } else {
        res.redirect(baseURL + '/');
    }
});

// Registration //
router.get('/register', function(req, res, next) {
    if (req.session.loggedin) {
        res.redirect(baseURL + '/');
    } else {
        res.render('register', { messages: req.flash('info') });
    }
});

router.post('/register', function(req, res, next) {
    if (!req.session.loggedin) {
      if (req.body.username.match(/^[a-zA-Z0-9]{1,20}$/)) {
        User.create(req.body, function(err, model) {
          if (err) {
              req.flash('info', "This username is already in use!");
              res.redirect(baseURL + '/register');
          } else {
            req.session.loggedin = true;
            req.session.user = model;
            req.flash('info', "Registered successfully! Welcome to PokeMMOn!");
            res.redirect(baseURL + '/');
          }
        });
      } else {
        req.flash('info', "Only 20 alphanumeric characters max please!");
        res.redirect(baseURL + '/register');
      }
    }
});

router.get('/fakemap', function(req, res, next) {
    var tiles = new Array(64);
    for (var i = 0; i < 64; i++) {
        tiles[i] = new Array();
    }

    for (var h = 0; h < 64; h++) {
        for (var w = 0; w < 64; w++) {
            tiles[h][w] = randomTile();
        }
    }

    res.json(tiles);

    function randomTile() {
        var tile = new Tile(
            Math.floor((Math.random() * 8016) + 1),
            Math.floor((Math.random() * 8016) + 1)
        );

        if (Math.random() > .5) {
            tile.walkable = true;
        } else {
            tile.walkable = false;
        }

        return tile;
    }
});

module.exports = router;
