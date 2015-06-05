function Tile(model, x, y) {
    this.model = model;
    this.x = x;
    this.y = y;
}

Tile.prototype.render = function render() {
    context.drawImage(this.sprite, x*16, y*16);
}