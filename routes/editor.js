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

router.route('/world')
    .post(function(req, res) {
        var name = req.body.name;
        var data  = req.body.data;

        if (name === undefined || data === undefined) {
            res.status(400).send({ msg: "Missing name and/or data variables!" });
        } else {
            fs.exists('worlds/' + name + '.json', function(exists) {
                if (exists) {
                    res.status(400).send({ msg: "World " + name + " already exists! Please use PUT to update world data." });
                } else {
                    fs.writeFile("worlds/" + name + '.json', data, function (err) {
                        if (err) {
                            console.log(err);
                            res.status(400).send({ msg: "An error was encountered while saving " + world + "!" });
                        } else {
                            console.log('Saved world ' + name + '.json!');
                            res.status(200).send({ msg: "Saved world " + name + " successfully!" });
                        }
                    });
                }
            });
        }
    })

    .get(function(req, res) {
        fs.readdir('worlds', function(err, files) {
            if (err) {
                res.status(400).send({ msg: "An error was retrieving worlds list" });
            } else {
                res.status(200).send(files.map(function(file) { return file.slice(0, -5); }));
            }
        });
    });

router.route('/world/:name')
    .get(function(req, res) {
        var name = req.params.name;

        fs.exists('worlds/' + name + '.json', function(exists) {
            if (exists) {
                console.log("Loaded file " + req.params.name + ".json successfully!");
                res.sendFile(process.cwd() + '/worlds/' + name + '.json');
            } else {
                res.status(400).send({ msg: "World " + name + " doesn't exist!" });
            }
        });
    })

    .put(function(req, res) {
        var name  = req.params.name;
        var data  = req.body.data;

        if (data === undefined) {
            res.status(400).send({ msg: "Missing data variable!" });
        } else {
            fs.exists('worlds/' + name + '.json', function(exists) {
                if (!exists) {
                    res.status(400).send({ msg: "World " + name + " doesn't exist! Please use POST to save a new world." });
                } else {
                    fs.writeFile("worlds/" + name + '.json', data, function (err) {
                        if (err) {
                            console.log(err);
                            res.status(400).send({ msg: "An error was encountered while saving world " + name + "!" });
                        } else {
                            console.log('Updated world ' + name + '.json!');
                            res.status(200).send({ msg: "Updated world " + name + " successfully!" });
                        }
                    });
                }
            });
        }
    })

    .delete(function(req, res) {
        var name  = req.params.name;

        fs.exists('worlds/' + name + '.json', function(exists) {
            if (!exists) {
                res.status(400).send({ msg: "World " + name + " doesn't exist!" });
            } else {
                fs.unlink("worlds/" + name + '.json', function (err) {
                    if (err) {
                        console.log(err);
                        res.status(400).send({ msg: "An error was encountered while deleting world " + name + "!" });
                    } else {
                        console.log('Deleted world ' + req.body.name + '.json successfully!');
                        res.status(200).send({ msg: "Deleted world " + name + " successfully!" });
                    }
                });
            }
        });


    });

module.exports = router;
