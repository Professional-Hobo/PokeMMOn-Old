$(function() {
    //
    // Download Buttons
    //
    $('#download-png').click(function(){
        var img = map.toDataURL("image/png");
        this.href = img;
    });
    $('#download-txt').click(function(){
        var output = mapArray;
        window.open('data:application/json;' + (window.btoa?'base64,'+btoa(JSON.stringify(output)):JSON.stringify(output)));
    });
});
