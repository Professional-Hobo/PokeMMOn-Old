$(function() {

    var timer;             // Input timer
    var delay        = 750;  // Delay for the notifications
    var inputDelay   = 50;   // Delay for inputs
    window.world     = {};   // Contains world data
    window.worldName = null;

    updateWorldList();     // Initial fetch of world list

    // Load in world on change
    $("#worlds").change(function() {

        // Hide the delete world section if user changes world
        hideSection("deleteWorldSection", function() {
            $("#deleteWorldText").html("");
        });

        // Disable delete/save buttons if no world selected
        if ($("#worlds")[0].selectedIndex == 0) {
            $("#deleteWorld").prop("disabled", true);
            $("#saveWorld").prop("disabled", true);

            $("#map").fadeOut(); // Disable map canvas if no world selected

            hideSection("deleteWorldSection");
            hideSection("deleteMapSection");
            hideSection("NewMapSection");
            hideSection("mapSection");

            window.worldName = null;
            window.map       = null;
        } else {
            $("#deleteWorld").prop("disabled", false);

            window.worldName = $("#worlds").val();
            loadWorld();
        }
    });

    // Load in map on change
    $("#maps").change(function() {

        // Disable delete/save buttons if no map selected
        if ($("#maps")[0].selectedIndex == 0) {
            $("#deleteMap").prop("disabled", true);
            $("#saveWorld").prop("disabled", true);

            $("#map").fadeOut(); // Disable map canvas if no map selected

            window.worldName = null;
            window.map       = null;
        } else {
            $("#deleteMap").prop("disabled", false);
            $("#saveWorld").prop("disabled", false);

            var map = window.map = $("#maps").val();   // Get name of map

            Object.keys(world.maps[window.map].tiles).forEach(function(xindex) {
                Object.keys(world.maps[window.map].tiles[xindex]).forEach(function(yindex) {
                    world.maps[window.map].tiles[xindex][yindex] = new Tile(world.maps[window.map].tiles[xindex][yindex].layers);
                });
            });

            pokemap.tiles = $.extend(true, [], world.maps[window.map].tiles);
            pokemap.width = world.maps[window.map].info.dimensions.width;
            pokemap.height = world.maps[window.map].info.dimensions.height;

            pokemap.updateAttr();
            pokemap.render();

            $("#map").fadeIn();   // Show map canvas

            UI.notify("Loaded map successfully!", "Map \"" + map + "\" was loaded successfully!", delay);
        }
    });

    // Reveal new world input slide down
    $("#newWorld").click(function() {
        hideSection("deleteWorldSection", function() {
            $("#deleteWorldText").html("");
        });

        showSection("newWorldSection", function() {
            $("#newWorldInput").focus();
        });
    });

    // Reveal new map input slide down
    $("#newMap").click(function() {
        hideSection("deleteMapSection", function() {
            $("#deleteMapText").html("");
        });

        showSection("newMapSection", function() {
            $("#newMapInput").focus();
        });
    });

    // Delete world
    $("#deleteWorld").click(function() {
        hideNewWorld();

        $("#deleteWorldText").html("Are you sure you want to delete world " + window.worldName + "?");
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
        $.ajax("editor/world/" + window.worldName, {type: 'DELETE', global: false, success: function(result) {
            UI.notify("Deleted world successfully!", "World \"" + $("#worlds").val() + "\" was deleted successfully!", delay);

            hideSection("deleteWorldSection", function() {
                $("#deleteWorldText").html("");
            });

            hideSection("mapSection");
            updateWorldList(function() {
                $("#worlds").val("");

                $("#deleteWorld").prop("disabled", true);
                $("#saveWorld").prop("disabled", true);

                $("#map").fadeOut();   // Hide map canvas

                window.worldName = null;
                window.map       = null;
            });
        }});
    })

    // Delete map
    $("#deleteMap").click(function() {
        hideNewMap();

        $("#deleteMapText").html("Are you sure you want to delete map " + window.map + "?");
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
        delete window.world.maps[window.map];
        UI.notify("Deleted map successfully!", "Map \"" + window.map + "\" was deleted successfully!", delay);

        hideSection("deleteMapSection", function() {
            $("#deleteMapText").html("");

            updateMapList(function() {
                $("#maps").val("");

                $("#deleteMap").prop("disabled", true);
                $("#saveWorld").prop("disabled", true);

                $("#map").fadeOut();   // Hide map canvas

                window.map       = null;
            });
        });

    })

    // Cancel new world slide down if cancel is clicked
    $('#newWorldCancel').click(function() { hideNewWorld(); });

    // Cancel new map slide down if cancel is clicked
    $('#newMapCancel').click(function() { hideNewMap(); });

    // POST new world to server, update worlds list, and load in new world.
    $('#newWorldSave').click(function() {
        var name = window.worldName = $("#newWorldInput").val();  // Update current world name

        $.ajax("editor/world", {method: "POST", data: {name: name, data: JSON.stringify({})}, global: false, success: function(data) {
            UI.notify("Created world successfully!", "World \"" + name + "\" was created successfully!", delay);

            hideNewWorld();
            updateWorldList(function() {
                $("#worlds").val(name);

                $("#deleteWorld").prop("disabled", false);
                $("#saveWorld").prop("disabled", true);
                $("#deleteMap").prop("disabled", true);

                // Load in world data
                loadWorld(true);   // Overrides default loaded world message
                hideNewMap();
            });

        }, fail: function() {
            UI.notify("Failed to create world", "World \"" + window.worldName + "\" failed to create!", delay);
        }});
    });

    // Only update the local world object. Save to server when save button is pushed
    $('#newMapSave').click(function() {
        var name = window.map = $("#newMapInput").val();   // Update current map name

        $.ajax('editor/world/default', {global: false, suppress: true, success: function(data) {
            world.maps[name] = data; // Update world object with new map data

            UI.notify("Created map successfully!", "Map \"" + name + "\" was created successfully!", delay);

            updateMapList(function() {
                $("#deleteMap").prop("disabled", false);
                $("#saveWorld").prop("disabled", false);

                $("#maps").val(name);  // Update map selection

                // Reset pokemap
                pokemap.height = 25;
                pokemap.width  = 25;

                pokemap.new();
                pokemap.updateAttr();
                pokemap.clear();
                pokemap.render();

                $("#map").fadeIn();    // Show map canvas

                hideNewMap();
            });
        }});
    });

    // Save world by PUT-ting on server
    $('#saveWorld').click(function() {

        // Update current map tile with pokemap data
        window.world.maps[window.map].tiles = $.extend(true, [], pokemap.tiles);

        // Update width and height
        window.world.maps[window.map].info.dimensions.width = pokemap.width;
        window.world.maps[window.map].info.dimensions.height = pokemap.height;

        $.ajax("editor/world/" + window.worldName, {method: "PUT", data: {data: JSON.stringify(window.world)}, global: true, suppress: true, success: function(data) {
            UI.notify("Saved world successfully!", "World \"" + window.worldName + "\" was saved successfully!", delay);

        }, fail: function() {
            UI.notify("Failed to save world", "World \"" + window.worldName + "\" failed to save!", delay);
        }});
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
            $.ajax('editor/world/', {global: false, success: function(data) {
                if (data.hasOwnProperty(worldName) || !pattern.test(worldName)) {
                    $("#newWorldSave").addClass("red").removeClass("green").prop("disabled", true);
                } else {
                    $("#newWorldSave").addClass("green").removeClass("red").prop("disabled", false);
                }
            }});
        } else {
            $("#newWorldSave").removeClass("green").removeClass("red").prop("disabled", true);
        }
    }

    // Verify map name is available and valid
    function queryNewMap() {
        var mapName = $("#newMapInput").val();
        var pattern = new RegExp("^[-a-zA-Z0-9_ ]*$");

        if (mapName != "") {
            if (window.world.maps.hasOwnProperty(mapName) || !pattern.test(mapName)) {
                $("#newMapSave").addClass("red").removeClass("green").prop("disabled", true);
            } else {
                $("#newMapSave").addClass("green").removeClass("red").prop("disabled", false);
            }
        } else {
            $("#newMapSave").removeClass("green").removeClass("red").prop("disabled", true);
        }
    }

    // Update list of worlds to edit
    function updateWorldList(callback) {
        $.ajax('editor/world/', {global: false, success: function(data) {
            window.worlds = data;

            // Update world select with world options
            $('#worlds')
                .empty()
                .append($("<option></option>")
                .attr("value", "")
                .text("--- Select a world ---"));

            $.each(data, function(key, value) {
                $('#worlds')
                    .append($("<option></option>")
                    .attr("value", key)
                    .text(key));
            });

            $('#worlds').prop("disabled", false);

            typeof callback === 'function' && callback();
        }});
    }

    // Updates the map dropdown menu with the contents of world.maps
    function updateMapList(callback) {
        // Load in available maps for editing
        $('#maps')
            .empty()
            .append($("<option></option>")
            .attr("value", "")
            .text("--- Select a map ---"));

        $.each(window.world.maps, function(key) {
            $('#maps')
                .append($("<option></option>")
                .attr("key", key)
                .text(key));
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
        $.ajax("editor/world/" + window.worldName, {global: true, suppress: true, success: function(data) {
            window.world = data; // Contains the world's data

            // Suppress disables default loaded world message
            if (!suppress) {
                UI.notify("Loaded world successfully!", "World \"" + window.worldName + "\" was loaded successfully!", delay);
            }

            // Fetch the list of maps in world
            updateMapList(function() {

                // Reveal map dropdown menu
                showSection("mapSection", function() {
                    $('#maps').prop("disabled", false);
                });
            });

        }, fail: function() {
            UI.notify("Failed to load world", "World \"" + window.worldName + "\" failed to load!", delay);
        }});
    }
});
