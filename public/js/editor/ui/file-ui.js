$(function() {

    var newWorldTimer;
    var newMapTimer;
    var delay = 750;
    window.world = {};

    // Initial fetch of world list
    updateWorldList();

    // Load in world on change
    // Disable delete button if selectedIndex is 0
    $("#worlds").change(function() {

        // Hide the delete world section if user changes world
        hideSection("deleteWorldSection", function() {
            $("#deleteWorldText").html("");
        });

        // Disable delete/save buttons if no world selected
        if ($("#worlds")[0].selectedIndex == 0) {
            $("#deleteWorld").prop("disabled", true);
            $("#saveWorld").prop("disabled", true);
        } else {
            $("#deleteWorld").prop("disabled", false);
            $("#saveWorld").prop("disabled", false);

            // Update current world name
            window.worldName = $("#worlds").val();

            // Load in world data
            loadWorld();
        }
    });

    // Disable delete buttons if selectedIndex is 0
    $("#maps").change(function() {
        if ($("#maps")[0].selectedIndex == 0) {
            $("#deleteMap").prop("disabled", true);
            $("#saveWorld").prop("disabled", true);
            $("#map").fadeOut(); // Disable map canvas if no map selected
        } else {
            $("#deleteMap").prop("disabled", false);
            $("#saveWorld").prop("disabled", false);

            // Load in map data to Pokemap canvas
            var map = window.map = $("#maps").val();

            UI.notify("Loaded map successfully!", "Map \"" + map + "\" was loaded successfully!", delay);

            updateMapList(function() {
                $("#deleteWorld").prop("disabled", false);
                $("#saveWorld").prop("disabled", false);

                $("#maps").val(map);

                $("#map").fadeIn();
            });
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
    })

    // Reveal new world input slide down
    $("#newMap").click(function() {
        hideSection("deleteMapSection", function() {
            $("#deleteMapText").html("");
        });

        showSection("newMapSection", function() {
            $("#newMapInput").focus();
        });
    })

    // Delete world
    $("#deleteWorld").click(function() {
        hideNewWorld();

        $("#deleteWorldText").html("Are you sure you want to delete world " + $("#worlds").val() + "?");
        showSection("deleteWorldSection");
    })

    // Delete world no
    $("#deleteWorldNo").click(function() {
        hideSection("deleteWorldSection", function() {
            $("#deleteWorldText").html("");
        });
    })

    // Delete world yes
    $("#deleteWorldYes").click(function() {
        $.ajax({
            url: 'editor/world/' + $("#worlds").val(),
            type: 'DELETE',
            global: false,
            success: function(result) {
                UI.notify("Deleted world successfully!", "World \"" + $("#worlds").val() + "\" was deleted successfully!", delay);

                hideSection("deleteWorldSection", function() {
                    $("#deleteWorldText").html("");
                });

                hideSection("mapSection");
                updateWorldList(function() {
                    $("#worlds").val("");
                    $("#deleteWorld").prop("disabled", true);
                    $("#saveWorld").prop("disabled", true);
                    $("#map").fadeOut();
                });
            }
        });
    })

    // Delete map
    $("#deleteMap").click(function() {
        hideNewMap();

        $("#deleteMapText").html("Are you sure you want to delete map " + $("#maps").val() + "?");
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
        delete window.world.maps[$("#maps").val()];
        UI.notify("Deleted map successfully!", "Map \"" + $("#maps").val() + "\" was deleted successfully!", delay);

        hideSection("deleteMapSection", function() {
            $("#deleteMapText").html("");
            updateMapList(function() {
                 $("#maps").val("");
                $("#deleteMap").prop("disabled", true);
                $("#saveMap").prop("disabled", true);
                $("#map").fadeOut();
            });
        });

    })

    // Cancel new world slide down if cancel is clicked
    $('#newWorldCancel').click(function() {
        hideNewWorld();
    });

    // Cancel new map slide down if cancel is clicked
    $('#newMapCancel').click(function() {
        hideNewMap();
    });

    // POST new world to server, update worlds list, and load in new world.
    $('#newWorldSave').click(function() {
        var name = window.worldName = $("#newWorldInput").val();
        $.ajax("editor/world", {method: "POST", data: {name: name, data: JSON.stringify({})}, global: false, success: function(data) {
            UI.notify("Created world successfully!", "World \"" + name + "\" was created successfully!", delay);
            hideNewWorld();

            updateWorldList(function() {
                $("#worlds").val(name);
                $("#deleteWorld").prop("disabled", false);
                $("#saveWorld").prop("disabled", false);
                $("#deleteMap").prop("disabled", true);

                // Load in world data
                loadWorld(true);
                hideNewMap();
            });

        }, fail: function() {
            UI.notify("Failed to create world", "World \"" + window.worldName + "\" failed to create!", delay);
        }});
    });

    // Only update the local world object. Save to server when Save button is pushed.
    $('#newMapSave').click(function() {
        var name = window.map = $("#newMapInput").val();

        $.ajax('editor/world/default', {global: false, suppress: true, success: function(data) {
            world.maps[name] = data;
            UI.notify("Created map successfully!", "Map \"" + name + "\" was created successfully!", delay);
            hideNewMap();

            updateMapList(function() {
                $("#deleteMap").prop("disabled", false);
                $("#saveMap").prop("disabled", false);

                //$("#maps").val(name + " [W: " + window.world.maps[name].info.dimensions.width + ", H: " + window.world.maps[name].info.dimensions.height + "]");
                $("#maps").val(name);
                hideNewMap();

                $("#map").fadeIn();
            });
        }});
    });

    // POST world to server, update worlds list, and load in new world.
    $('#saveWorld').click(function() {
        // Update window.world.maps[window.map].tiles with pokemap data
        window.world.maps[window.map].tiles = pokemap.tiles;

        $.ajax("editor/world/" + window.worldName, {method: "PUT", data: {data: JSON.stringify(window.world)}, global: true, suppress: true, success: function(data) {
            UI.notify("Saved world successfully!", "World \"" + window.worldName + "\" was saved successfully!", delay);

        }, fail: function() {
            // fail
        }});
    });

    // Wait for user's input 50 ms before querying for valid name
    $('#newWorldInput').keyup(function() {
        clearTimeout(newWorldTimer);
        newWorldTimer = setTimeout(queryNewWorld, 50);
    });

    $('#newWorldInput').keydown(function() {
        clearTimeout(newWorldTimer);
    });

    // Wait for user's input 50 ms before querying for valid name
    $('#newMapInput').keyup(function() {
        clearTimeout(newMapTimer);
        newMapTimer = setTimeout(queryNewMap, 50);
    });

    $('#newWorldInput').keydown(function() {
        clearTimeout(newMapTimer);
    });

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
    function loadWorld(suppress, callback) {
        $.ajax("editor/world/" + window.worldName, {global: true, suppress: true, success: function(data) {
            window.world = data; // Contains the world's data

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

            typeof callback === 'function' && callback();

        }, fail: function() {
            UI.notify("Failed to load world", "World \"" + window.worldName + "\" failed to load!", delay);
        }});
    }
});
