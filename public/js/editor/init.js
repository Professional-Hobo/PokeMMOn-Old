$(function() {
    window.pokemap = new PokeMap();
    window.tileset = new Tileset();

    $("#dim").html("Current map dim: " + pokemap.width + "x" + pokemap.height);
});