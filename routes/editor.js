var express  = require('express');
var fs       = require('fs');
var path     = require('path'); 
var router   = express.Router();
var settings = require('../settings.json');

router.get('/', function(req, res, next) {
    res.render('editor/index', { messages: req.flash('info') });
});

router.get('/new', function(req, res, next) {
    res.render('editor/new', { messages: req.flash('info') });
});

// Save world json data
router.post('/save', function(req, res, next) {
    fs.writeFile("worlds/" + req.body.name + '.json', req.body.data, function (err) {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        }

        console.log('Saved ' + req.body.name + '.json!');
        res.sendStatus(200);
    });
});

// Load world json data
router.get('/load/:name', function(req, res, next) {
    fs.exists('worlds/' + req.params.name + '.json', function(exists) {
        if (exists) {
            console.log("Loaded file " + req.params.name + ".json successfully!");
            res.sendFile(process.cwd() + '/worlds/' + req.params.name + '.json');
        } else {
            res.sendStatus(400); 
        }
    });
});

module.exports = router;
