var express  = require('express');
var fs       = require('fs');
var path     = require('path');
var rimraf   = require('rimraf');
var sizeOf   = require('image-size');
var pretty   = require('prettysize');
var _        = require('lodash');
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

        var pattern = new RegExp("^[-a-zA-Z0-9_ ]*$");

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
                        var git = require('simple-git')('worlds/' + name);
                        git.init();
                        fs.writeFile("worlds/" + name + '/map.json', JSON.stringify(data), function (err) {
                            if (err) {
                                console.log(err);
                                res.status(400).send({ msg: "An error was encountered while saving " + world + "!" });
                            } else {
                                console.log('Saved world ' + name + '!');
                                res.status(200).send({ msg: "Saved world " + name + " successfully!" });
                            }
                        });
                    });
                }
            });
        }
    })

    .get(function(req, res) {

        fs.readdir('worlds', function(err, files) {
            if (err) {
                res.status(400).send({ msg: "An error occured while retrieving worlds list" });
            } else {
                var info = {};
                var size = 0;

                files.forEach(function(world) {
                    size = fs.statSync("worlds/" + world + "/map.json")["size"];
                    info[world] = {size: pretty(size)};
                });

                res.status(200).send(info);
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

                            var git = require('simple-git')('worlds/' + name);
                            git.add('.')
                            git.commit(new Date().getTime(), function(err, blah) {
                                res.status(200).send({ msg: "Updated world " + name + " successfully!" });
                            });
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

router.route('/worldRevisions/:name')
    .get(function(req, res) {
        var name = req.params.name;

        fs.exists('worlds/' + name, function(exists) {
            if (exists) {
                var git = require('simple-git')('worlds/' + name);
                git.log(function(err, log) {
                    var revisions = [];
                    _.each(log.all, function(revision) {
                        revisions.push([revision.hash.slice(1), revision.message.match(/\d+/)[0]]);
                    });

                    res.status(200).send(revisions);
                });
            } else {
                res.status(400).send({ msg: "World " + name + " doesn't exist!" });
            }
        })
    })

    .post(function(req, res) {
        var name = req.params.name;
        fs.exists('worlds/' + name, function(exists) {
            if (exists) {
                var git = require('simple-git')('worlds/' + name);
                git.show([req.body.hash + ":map.json"], function(err, result) {
                    fs.writeFile(process.cwd() + '/worlds/' + name + '/tmpMap.json', result, function(err) {
                        res.sendFile(process.cwd() + '/worlds/' + name + '/tmpMap.json');
                    });
                });
            } else {
                res.status(404).send("World not found!");
            }
        });
    });

router.get('/sets/:name', function(req, res, next) {
    var name = req.params.name;

    fs.exists('public/img/editor/sets/' + name + '.png', function(exists) {
        if (exists) {
            console.log("Loaded tileset " + name + " successfully!");
            var dim = sizeOf('public/img/editor/sets/' + name + '.png');
            res.status(200).send({ width: dim.width, height: dim.height });
        } else {
            res.status(400).send({ msg: "Tileset " + name + " doesn't exist!" });
        }
    });
});

router.get('/sets', function(req, res, next) {
    fs.readdir('public/img/editor/sets', function(err, files) {
        var sets = {};

        if (err) {
            res.status(400).send({ msg: "An error occured while retrieving sets list" });
        } else {
            files.forEach(function(file) {
                file = file.slice(0, -4);
                var dim = sizeOf('public/img/editor/sets/' + file + '.png');

                sets[file] = {};
                sets[file].width = dim.width;
                sets[file].height = dim.height;
            });

            res.status(200).send(sets);
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

router.get('/world/default', function(req, res, next) {

    var data = {
      "info": {
        "creation_date": Math.floor(new Date() / 1000),
        "modification_date": Math.floor(new Date() / 1000),
        "description": "",
        "dimensions": {
          "width": 25,
          "height": 25
        }
      },
      "tiles": []
    }

    res.status(200).send(data);
});

module.exports = router;
