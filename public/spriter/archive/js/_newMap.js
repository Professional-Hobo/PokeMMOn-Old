// Generate a new blank map
function newBlankMap(src, w, h){
    m.canvas.width = w*grid;
    m.canvas.height = h*grid;

    for(var n=0; n<h; n++){
        for(var i=0; i<w; i++){
            drawImage(brush, i, n);
        }   
    }
}