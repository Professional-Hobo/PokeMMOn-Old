$(function() {

    var timer; // Input timer
    var delay = 750; // Delay for the notifications
    var inputDelay = 50; // Delay for inputs

    updateWorldList(); // Initial fetch of world list

    // Load in world on change
    $("#worlds").change(function() {
        $(this).blur();

        // Hide the delete world section if user changes world
        hideSection("deleteWorldSection", function() {
            $("#deleteWorldText").html("");
        });

        // Disable delete/save buttons if no world selected
        // Index 0 is for "New World"
        if ($("#worlds")[0].selectedIndex === 0) {
            $("#deleteWorld").prop("disabled", true);
            $("#renameWorld").prop("disabled", true);

            hideSection("deleteWorldSection");
            hideSection("deleteMapSection");
            hideSection("NewMapSection");

            pokeworld = new PokeWorld();

            worldName = null; // Player determines world name when they save for the first time
            map = "default";

            $('#maps')
                .empty()
                .append($("<option></option>")
                    .attr("value", "")
                    .text("--- New Map ---"))
                .append($("<option></option>")
                    .attr("key", "default")
                    .text("default"))
                .val("default")
                .prop("disabled", false);

            $('#revisions')
                .empty()
                .append($("<option></option>")
                    .attr("value", "")
                    .text("--- No revisions available ---"));

            pokeworld.pokemap.render();

        } else {
            $("#deleteWorld").prop("disabled", false);
            $("#renameWorld").prop("disabled", false);
            hideSection("newMapSection");

            worldName = $("#worlds").val(); // Fetch current chosen world value
            loadWorld(); // Load world data and update map stuff
            loadRevisions();
        }
    });

    // Load in map on change
    $("#maps").change(function() {
        $(this).blur();

        // Disable delete/save buttons if no map selected
        if ($("#maps")[0].selectedIndex === 0) {
            $("#deleteMap").prop("disabled", true);
            $("#renameMap").prop("disabled", true);
            $("#saveWorld").prop("disabled", true);
            $("#newMapCancel").prop("disabled", false);

            showSection("newMapSection", function() {
                $("#newMapInput").focus();
            });

            map = null;
        } else {
            $("#deleteMap").prop("disabled", false);
            $("#renameMap").prop("disabled", false);
            $("#saveWorld").prop("disabled", false);

            map = $("#maps").val(); // Get name of map
            loadPokeMap();

            UI.notify("Loaded map successfully!", "Map \"" + map + "\" was loaded successfully!", delay);
        }
    });

    // Load in revision on change
    $("#revisions").change(function() {
        console.log($("#revisions").find('option:selected').attr("key"));
        $.ajax('editor/worldRevisions/' + worldName, {
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                hash: $("#revisions").find('option:selected').attr("key")
            }),
            global: false,
            success: function(data) {

                pokeworld.load(data); // Contains the world's data
                var currentMap = $("#maps").val(); // Save current selected map to restore after updating map list

                // Fetch the list of maps in world
                updateMapList(function() {

                    // Restore previous selected option
                    if (currentMap in pokeworld.maps) {
                        $("#maps").val(currentMap);
                    } else {
                        $("#maps").val(map);
                    }

                    $("#deleteMap").prop("disabled", false);
                    $("#renameMap").prop("disabled", false);

                    map = $("#maps").val(); // Get name of map
                    loadPokeMap();
                });
            }
        });
    });

    // Delete world
    $("#deleteWorld").click(function() {
        hideNewWorld();

        $("#deleteWorldText").html("Are you sure you want to delete world " + worldName + "?");
        showSection("deleteWorldSection");
    });

    // Delete world no
    $("#deleteWorldNo").click(function() {
        hideSection("deleteWorldSection", function() {
            $("#deleteWorldText").html("");
        });
    });

    // Delete world yes
    $("#deleteWorldYes").click(function() {
        $.ajax("editor/world/" + worldName, {
            type: 'DELETE',
            global: false,
            success: function(result) {
                UI.notify("Deleted world successfully!", "World \"" + $("#worlds").val() + "\" was deleted successfully!", delay);

                hideSection("deleteWorldSection", function() {
                    $("#deleteWorldText").html("");
                });

                updateWorldList(function() {
                    $("#worlds").val("");

                    $("#deleteWorld").prop("disabled", true);
                    $("#renameWorld").prop("disabled", true);

                    pokeworld = new PokeWorld();
                    world = pokeworld.export();
                    worldName = null;
                    map = "default";


                    // Reset pokemap
                    pokeworld.pokemap.dim.height = 25;
                    pokeworld.pokemap.dim.width = 25;
                    pokeworld.populate(0)
                    pokeworld.pokemap.updateAttr();
                    pokeworld.pokemap.clear();
                    pokeworld.pokemap.render();

                    // Reset map dropdown
                    $('#maps')
                        .empty()
                        .append($("<option></option>")
                            .attr("value", "")
                            .text("--- New Map ---"))
                        .append($("<option></option>")
                            .attr("key", "default")
                            .text("default"))
                        .val("default")
                        .prop("disabled", false);

                    $('#revisions')
                        .empty()
                        .append($("<option></option>")
                            .attr("value", "")
                            .text("--- No revisions available ---"));
                });
            }
        });
    })

    // Delete map
    $("#deleteMap").click(function() {
        hideNewMap();

        $("#deleteMapText").html("Are you sure you want to delete map " + map + "?");
        showSection("deleteMapSection");
    })

    // Delete map no
    $("#deleteMapNo").click(function() {
        hideSection("deleteMapSection", function() {
            $("#deleteMapText").html("");
        });
    })

    // Delete map yes
    $("#deleteMapYes").click(function() {
        delete pokeworld.maps[map];
        UI.notify("Deleted map successfully!", "Map \"" + map + "\" was deleted successfully!", delay);

        hideSection("deleteMapSection", function() {
            $("#deleteMapText").html("");

            updateMapList(function() {
                if (Object.keys(pokeworld.maps).length === 0) {
                    map = null;
                    $("#maps").val("");

                    $("#saveWorld").prop("disabled", true);
                    $("#deleteMap").prop("disabled", true);
                    $("#renameMap").prop("disabled", true);
                    $("#newMapCancel").prop("disabled", true);

                    showSection("newMapSection", function() {
                        $("#newMapInput").focus();
                    });

                    // Reset pokemap
                    pokeworld.pokemap.dim.height = 25;
                    pokeworld.pokemap.dim.width = 25;

                    pokeworld.pokemap.updateAttr();
                    pokeworld.pokemap.clear();
                    pokeworld.pokemap.render();
                } else {
                    map = Object.keys(pokeworld.maps)[0]; // Load in first map
                    $("#maps").val(map);
                    // change to next map option and load in map
                }
            });
        });

    })

    // Cancel new world slide down if cancel is clicked
    $('#newWorldCancel').click(function() {
        hideNewWorld();
    });

    // Cancel new map slide down if cancel is clicked
    $('#newMapCancel').click(function() {
        map = Object.keys(pokeworld.maps)[0]; // Load in first map
        $("#maps").val(map);
        $("#saveWorld").prop("disabled", false);
        $("#deleteMap").prop("disabled", false);
        $("#renameMap").prop("disabled", false);
        hideNewMap();
    });

    // POST new world to server, update worlds list, and load in new world.
    $('#newWorldSave').click(function() {
        var name = worldName = $("#newWorldInput").val(); // Update current world name
        $.ajax("editor/world", {
            method: "POST",
            contentType: 'application/json',
            data: JSON.stringify({
                name: name,
                data: pokeworld.export()
            }),
            global: false,
            success: function(data) {
                UI.notify("Created world successfully!", "World \"" + name + "\" was created successfully!", delay);

                hideNewWorld();
                updateWorldList(function() {
                    $("#worlds").val(name);

                    $("#deleteWorld").prop("disabled", false);
                    $("#renameWorld").prop("disabled", false);
                    $("#deleteMap").prop("disabled", false);

                    // Load in world data
                    loadWorld(true); // Overrides default loaded world message
                    hideNewMap();
                });

            },
            fail: function() {
                UI.notify("Failed to create world", "World \"" + worldName + "\" failed to create!", delay);
            }
        });
    });

    // Only update the local world object. Save to server when save button is pushed
    $('#newMapSave').click(function() {
        var name = map = $("#newMapInput").val(); // Update current map name

        pokeworld.maps[name] = {
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
        };

        UI.notify("Created map successfully!", "Map \"" + name + "\" was created successfully!", delay);

        updateMapList(function() {
            $("#deleteMap").prop("disabled", false);
            $("#renameMap").prop("disabled", false);
            $("#saveWorld").prop("disabled", false);

            $("#maps").val(name); // Update map selection

            // Reset pokemap
            pokeworld.pokemap.dim.height = 25;
            pokeworld.pokemap.dim.width = 25;

            // Allocate space for the map tiles
            pokeworld.maps[map].tiles = new Array(pokeworld.maps[map].info.dimensions.height);
            for (var i = 0; i < pokeworld.maps[map].info.dimensions.width; i++) {
                pokeworld.maps[map].tiles[i] = new Array();
            }

            pokeworld.populate(0) // Populate map tiles with grass

            pokeworld.pokemap = new PokeMap(pokeworld.maps[map].tiles.slice()); // Send in the map tiles to pokemap

            pokeworld.pokemap.updateAttr();
            pokeworld.pokemap.clear();
            pokeworld.pokemap.render();

            hideNewMap();
        });
    });

    // Save world by PUT-ting on server
    $('#saveWorld').click(function() {

        // Check if new world
        if ($("#worlds")[0].selectedIndex === 0) {
            showSection("newWorldSection");
            $("#newWorldInput").focus();
        } else {

            // Update current map tile with pokemap data
            pokeworld.maps[map].tiles = $.extend(true, [], pokeworld.pokemap.tiles);

            // Update width and height
            pokeworld.maps[map].info.dimensions.width = pokeworld.pokemap.dim.width;
            pokeworld.maps[map].info.dimensions.height = pokeworld.pokemap.dim.height;

            $.ajax("editor/world/" + worldName, {
                method: "PUT",
                data: {
                    data: JSON.stringify(pokeworld.export())
                },
                global: true,
                suppress: true,
                success: function(data) {
                    UI.notify("Saved world successfully!", "World \"" + worldName + "\" was saved successfully!", delay);
                    loadRevisions();
                },
                fail: function() {
                    UI.notify("Failed to save world", "World \"" + worldName + "\" failed to save!", delay);
                }
            });
        }
    });

    // Wait inputDelay ms for user's input
    $('#newWorldInput').keyup(function() {
        clearTimeout(timer);
        timer = setTimeout(queryNewWorld, inputDelay);
    });

    $('#newMapInput').keyup(function() {
        clearTimeout(timer);
        timer = setTimeout(queryNewMap, inputDelay);
    });

    $('#newWorldInput').keydown(function() {
        clearTimeout(timer);
    });

    $('#newWorldInput').keydown(function() {
        clearTimeout(timer);
    });

    // Verify world name is available and valid
    function queryNewWorld() {
        var worldName = $("#newWorldInput").val();
        var pattern = new RegExp("^[-a-zA-Z0-9_ ]*$");

        if (worldName != "") {
            $.ajax('editor/world/', {
                global: false,
                success: function(data) {
                    if (data.hasOwnProperty(worldName) || !pattern.test(worldName)) {
                        $("#newWorldSave").addClass("red").removeClass("green").prop("disabled", true);
                    } else {
                        $("#newWorldSave").addClass("green").removeClass("red").prop("disabled", false);
                    }
                }
            });
        } else {
            $("#newWorldSave").removeClass("green").removeClass("red").prop("disabled", true);
        }
    }

    // Verify map name is available and valid
    function queryNewMap() {
        var mapName = $("#newMapInput").val();
        var pattern = new RegExp("^[-a-zA-Z0-9_ ]*$");

        if (mapName != "") {
            if (pokeworld.maps.hasOwnProperty(mapName) || !pattern.test(mapName)) {
                $("#newMapSave").addClass("red").removeClass("green").prop("disabled", true);
            } else {
                $("#newMapSave").addClass("green").removeClass("red").prop("disabled", false);
            }
        } else {
            $("#newMapSave").removeClass("green").removeClass("red").prop("disabled", true);
        }
    }

    // Update list of worlds to choose from
    function updateWorldList(callback) {
        $.ajax('editor/world/', {
            global: false,
            success: function(data) {
                worlds = data;

                // Update world select with world options
                $('#worlds')
                    .empty()
                    .append($("<option></option>")
                        .attr("value", "")
                        .text("--- New world ---"));

                $.each(data, function(key, value) {
                    $('#worlds')
                        .append($("<option></option>")
                            .attr("value", key)
                            .text(key));
                });

                typeof callback === 'function' && callback();
            }
        });
    }

    // Updates the map dropdown menu with the contents of world.maps
    function updateMapList(callback) {
        // Load in available maps for editing
        $('#maps')
            .empty()
            .append($("<option></option>")
                .attr("value", "")
                .text("--- New Map ---"));

        $.each(pokeworld.maps, function(key) {
            $('#maps')
                .append($("<option></option>")
                    .attr("key", key)
                    .text(key));
        });

        typeof callback === 'function' && callback();
    }

    function updateRevisionList(callback) {
        // Load in available maps for editing
        $('#revisions')
            .empty();

        $.each(pokeworld.revisions, function(key, item) {
            $('#revisions')
                .append($("<option></option>")
                    .attr("key", item[0])
                    .text((key === 0 ? "[latest] " : "") + item[0].slice(0, 6) + " - " + moment(+item[1]).format('MMM Do YYYY, h:mm:ss a')));
        });

        typeof callback === 'function' && callback();
    }

    // Reveal a section by id
    function showSection(section, callback) {
        $("#" + section).slideDown("medium", function() {
            typeof callback === 'function' && callback();
        });
    }

    // Hide a section by id
    function hideSection(section, callback) {
        $("#" + section).slideUp("medium", function() {
            typeof callback === 'function' && callback();
        });
    }

    function hideNewWorld() {
        hideSection("newWorldSection", function() {
            $("#newWorldSave").removeClass("green").removeClass("red").prop("disabled", true);
            $("#newWorldInput").val("");
        });
    }

    function hideNewMap() {
        hideSection("newMapSection", function() {
            $("#newMapSave").removeClass("green").removeClass("red").prop("disabled", true);
            $("#newMapInput").val("");
        });
    }

    // Load world from server
    function loadWorld(suppress) {
        $.ajax("editor/world/" + worldName, {
            global: true,
            suppress: true,
            success: function(data) {
                pokeworld.load(data); // Contains the world's data

                // Suppress disables default loaded world message
                if (!suppress) {
                    UI.notify("Loaded world successfully!", "World \"" + worldName + "\" was loaded successfully!", delay);
                }

                var currentMap = $("#maps").val(); // Save current selected map to restore after updating map list

                // Fetch the list of maps in world
                updateMapList(function() {

                    // Restore previous selected option
                    if (currentMap in pokeworld.maps) {
                        $("#maps").val(currentMap);
                    } else {
                        $("#maps").val(map);
                    }

                    $("#deleteMap").prop("disabled", false);
                    $("#renameMap").prop("disabled", false);

                    map = $("#maps").val(); // Get name of map
                    loadPokeMap();
                });

            },
            fail: function() {
                UI.notify("Failed to load world", "World \"" + worldName + "\" failed to load!", delay);
            }
        });
    }

    // Load world from server
    function loadRevisions() {
        $.ajax("editor/worldRevisions/" + worldName, {
            global: true,
            suppress: true,
            success: function(data) {
                pokeworld.revisions = data;

                // Fetch the list of maps in world
                updateRevisionList();

            },
            fail: function() {
                UI.notify("Failed to load world Revisions", "World \"" + worldName + "\" failed to load!", delay);
            }
        });
    }

    function loadPokeMap() {
        Object.keys(pokeworld.maps[map].tiles).forEach(function(xindex) {
            Object.keys(pokeworld.maps[map].tiles[xindex]).forEach(function(yindex) {
                pokeworld.maps[map].tiles[xindex][yindex] = new Tile(pokeworld.maps[map].tiles[xindex][yindex].layers);
            });
        });

        pokeworld.pokemap.tiles = $.extend(true, [], pokeworld.maps[map].tiles);
        pokeworld.pokemap.dim.width = pokeworld.maps[map].info.dimensions.width;
        pokeworld.pokemap.dim.height = pokeworld.maps[map].info.dimensions.height;

        pokeworld.pokemap.updateAttr();
        pokeworld.pokemap.render();

        pokeworld.pokemap.updateDim();
    }

    // Exported functions for UI
    UI.updateMapList = updateMapList;
    UI.hideSection = hideSection;
});
