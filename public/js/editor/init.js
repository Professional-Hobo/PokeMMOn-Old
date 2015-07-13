$(function() {

    async.series([
        function(callback) {
            UI.notify("Initializing", "Initializing World Editor Data", 1000);
            callback(null);
        },

        function(callback) {
            window.tileset = new Tileset();

            // Load all tilesets and make default all
            tileset.loadTilesets(function() {
                tileset.changeTileset("all", function() {
                    callback(null);
                });
            });
        },

        function(callback) {
            window.pokeworld = new PokeWorld();
            window.worldName = null;
            window.map       = "default";

            $("#worldSection").slideDown("medium");
            $("#mapSection").slideDown("medium");

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
            callback(null);
        },

        function(callback) {
            window.pokeworld.pokemap.render();
            callback(null);
        },

        function(callback) {
            UI.notify("Finished", "Loaded successfully!", 1000);
            callback(null);
        }
    ]);

    //$("#dim").html("Current map dim: " + pokemap.width + "x" + pokemap.height);
});
