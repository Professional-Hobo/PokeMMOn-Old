$(function() {

    var newWorldTimer;
    var newMapTimer;
    window.world = {};

    // Fetch world list
    updateWorldList();

    // Disable delete button if selectedIndex is 0
    $("#worlds").change(function() {
        hideSection("deleteWorldSection", function() {
            $("#deleteWorldText").html("");
        });

        if ($("#worlds")[0].selectedIndex == 0) {
            $("#deleteWorld").prop("disabled", true);
            $("#saveWorld").prop("disabled", true);
        } else {
            $("#deleteWorld").prop("disabled", false);
            $("#saveWorld").prop("disabled", false);

            // Load in world data
            loadWorld();
        }
    });

    // Disable delete buttons if selectedIndex is 0
    $("#maps").change(function() {
        if ($("#maps")[0].selectedIndex == 0) {
            $("#deleteMap").prop("disabled", true);
            $("#saveWorld").prop("disabled", true);
        } else {
            $("#deleteMap").prop("disabled", false);
            $("#saveWorld").prop("disabled", false);

            // Load in map data to Pokemap canvas
            var map = $("#maps").val();
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
                UI.notify("Deleted world successfully!", "World \"" + $("#worlds").val() + "\" was deleted successfully!", 2500);

                hideSection("deleteWorldSection", function() {
                    $("#deleteWorldText").html("");
                });

                hideSection("mapSection");
                updateWorldList(function() {
                    $("#worlds").val("");
                    $("#deleteWorld").prop("disabled", true);
                    $("#saveWorld").prop("disabled", true);
                });
            }
        });
    })

    // Cancel new world slide down if escape is pressed
    $('#newWorldInput').keyup(function(e) {
        if (e.keyCode == 27){
            hideNewWorld();
        }
    });

    // Cancel new world slide down if cancel is clicked
    $('#newWorldCancel').click(function() {
        hideNewWorld();
    });

    // Cancel new map slide down if escape is pressed
    $('#newMapInput').keyup(function(e) {
        if (e.keyCode == 27){
            hideNewMap();
        }
    });

    // Cancel new map slide down if cancel is clicked
    $('#newMapCancel').click(function() {
        hideNewMap();
    });

    // POST new world to server, update worlds list, and load in new world.
    $('#newWorldSave').click(function() {
        var name = $("#newWorldInput").val();
        $.ajax("editor/world", {method: "POST", data: {name: name, data: JSON.stringify({})}, global: false, success: function(data) {
            UI.notify("Created world successfully!", "World \"" + name + "\" was created successfully!", 2500);
            hideNewWorld();

            updateWorldList(function() {
                $("#worlds").val(name);
                $("#deleteWorld").prop("disabled", false);
                $("#saveWorld").prop("disabled", false);

                // Load in world data
                loadWorld(true);
                hideNewMap();
            });

        }, fail: function() {
            // fail
        }});
    });

    // Only update the local world object. Save to server when Save button is pushed.
    $('#newMapSave').click(function() {
        var name = $("#newMapInput").val();

        $.ajax('editor/world/default', {global: false, suppress: true, success: function(data) {
            world.maps[name] = data;
            UI.notify("Created map successfully!", "map \"" + name + "\" was created successfully!", 2500);
            hideNewMap();

            updateMapList(function() {
                $("#deleteWorld").prop("disabled", false);
                $("#saveWorld").prop("disabled", false);

                $("#maps").val(name + " [W: " + window.world.maps[name].info.dimensions.width + ", H: " + window.world.maps[name].info.dimensions.height + "]");
                hideNewMap();

                $("#map").fadeIn();
            });
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
                    .text(key + " - " + value.size));
            });

            $('#worlds').prop("disabled", false);

            typeof callback === 'function' && callback();
        }});
    }

    function updateMapList(callback) {
        // Load in new world

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
                .text(key + " [W: " + window.world.maps[key].info.dimensions.width + ", H: " + window.world.maps[key].info.dimensions.height + "]"));
        });

        typeof callback === 'function' && callback();
    }

    function showSection(section, callback) {
        $("#" + section).slideDown("medium", function() {
            typeof callback === 'function' && callback();
        });
    }

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

    function loadWorld(supress) {
        var world = $("#worlds").val();
        $.ajax("editor/world/" + world, {global: true, suppress: true, success: function(data) {
            window.world = data;

            if (!supress) {
                UI.notify("Loaded world successfully!", "World \"" + world + "\" was loaded successfully!", 2500);
            }

            updateMapList(function() {

                // Reveal map view
                showSection("mapSection", function() {
                    $('#maps').prop("disabled", false);
                });
            });
        }, fail: function() {
            UI.notify("Failed to load world", "World \"" + world + "\" failed to load!", 2500);
        }});
    }
});
