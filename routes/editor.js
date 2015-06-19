var express  = require('express');
var fs       = require('fs');
var path     = require('path'); 
var rimraf   = require('rimraf');
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
        var pattern = new RegExp("^[a-zA-Z0-9_ ]*$");

        if (name === undefined || data === undefined) {
            res.status(400).send({ msg: "Missing name and/or data variables!" });
        } else {
            fs.exists('worlds/' + name, function(exists) {
                if (exists) {
                    res.status(400).send({ msg: "World " + name + " already exists! Please use PUT to update world data." });
                } else if (!pattern.test(name)) {
                    res.status(400).send({ msg: name + " is an invalid name." });
                } else {
                    fs.mkdir('worlds/' + name, "0755", function() {
                        fs.writeFile("worlds/" + name + '/map.json', data, function (err) {
                            if (err) {
                                console.log(err);
                                res.status(400).send({ msg: "An error was encountered while saving " + world + "!" });
                            } else {
                                console.log('Saved world ' + name + '!');
                                res.status(200).send({ msg: "Saved world " + name + " successfully!" });
                            }
                        });
                    })
                }
            });
        }
    })

    .get(function(req, res) {
        fs.readdir('worlds', function(err, files) {
            if (err) {
                res.status(400).send({ msg: "An error occured while retrieving worlds list" });
            } else {
                res.status(200).send(files);
            }
        });
    });

router.route('/world/:name')
    .get(function(req, res) {
        var name = req.params.name;

        fs.exists('worlds/' + name, function(exists) {
            if (exists) {
                console.log("Loaded word " + name + " successfully!");
                res.sendFile(process.cwd() + '/worlds/' + name + '/map.json');
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
            fs.exists('worlds/' + name, function(exists) {
                if (!exists) {
                    res.status(400).send({ msg: "World " + name + " doesn't exist! Please use POST to save a new world." });
                } else {
                    fs.writeFile("worlds/" + name + '/map.json', data, function (err) {
                        if (err) {
                            console.log(err);
                            res.status(400).send({ msg: "An error was encountered while saving world " + name + "!" });
                        } else {
                            console.log('Updated world ' + name + '!');
                            res.status(200).send({ msg: "Updated world " + name + " successfully!" });
                        }
                    });
                }
            });
        }
    })

    .delete(function(req, res) {
        var name  = req.params.name;

        fs.exists('worlds/' + name, function(exists) {
            if (!exists) {
                res.status(400).send({ msg: "World " + name + " doesn't exist!" });
            } else {
                rimraf("worlds/" + name, function () {
                    console.log('Deleted world ' + name + ' successfully!');
                    res.status(200).send({ msg: "Deleted world " + name + " successfully!" });
                });
            }
        });


    });

router.get('/sets/:name', function(req, res, next) {

});

router.get('/sets', function(req, res, next) {
    fs.readdir('public/img/editor/sets', function(err, files) {
        if (err) {
            res.status(400).send({ msg: "An error occured while retrieving sets list" });
        } else {
            res.status(200).send(files.map(function(file) { return file.slice(0, -4); }));
        }
    });
});

router.get('/uis', function(req, res, next) {
    fs.readdir('public/js/editor/ui', function(err, files) {
        if (err) {
            res.status(400).send({ msg: "An error occured while retrieving ui list" });
        } else {
            res.status(200).send(files.map(function(ui) { return "/js/editor/ui/" + ui; }));
        }
    });
});

module.exports = router;