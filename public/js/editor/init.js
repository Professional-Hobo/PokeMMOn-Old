var score = 0;
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
            window.bounds = {
                largest: {
                    x: 0,
                    y: 0
                },
                smallest: {
                    x: 0,
                    y: 0
                }
            };

            window.pokeworld = new PokeWorld();
            window.worldName = null;
            window.map = "default";

            $("#worldSection").slideDown("medium");
            $("#mapSection").slideDown("medium");
            $("#revisionSection").slideDown("medium");

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
            // Start up listerners to resize the canvas if the window is resized
            window.addEventListener('load', resize, false);
            window.addEventListener('resize', resize, false);

            // Start up render loop
            window.renderLoop = window.setInterval(function() {
                pokeworld.pokemap.render();
                score++;
            }, 1000 / 60);

            callback(null);
        },

        function(callback) {
            UI.notify("Finished", "Loaded successfully!", 1000);
            callback(null);
        }
    ]);

    function resize() {
        pokeworld.pokemap.ctx.canvas.width = Math.floor($(".canvas-container").width() / 16) * 16 - 64;
        pokeworld.pokemap.ctx.canvas.height = Math.floor($(".canvas-container").height() / 16) * 16 - 64;
    }
});


function benchmark() {
    var total = 0;
    score = 0;
    var startTime = new Date().getTime();
    pokeworld.pokemap.resize("right", 225);
    pokeworld.pokemap.resize("down", 225);
    pokeworld.pokemap.random(function() {
        var y = window.setInterval(function() {
            pokeworld.pokemap.offset.x -= Math.floor(Math.random() * 16)
            pokeworld.pokemap.offset.x += Math.floor(Math.random() * 16)
            pokeworld.pokemap.offset.y -= Math.floor(Math.random() * 16)
            pokeworld.pokemap.offset.y += Math.floor(Math.random() * 16)
            pokeworld.pokemap.random(function() {
                if (++total === 100) {
                    var diff = new Date().getTime() - startTime;
                    clearInterval(y);
                    UI.notify("Benchmark score", "Benchmark score is " + score / (diff / 100000), 13371337)
                }
            })
        });
    });
}
