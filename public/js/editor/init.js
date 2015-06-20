$(function() {
    pokemap = new PokeMap();
    tileset = new Tileset();

    $("#dim").html("Current map dim: " + pokemap.width + "x" + pokemap.height);
});