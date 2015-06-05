files = [];
NProgress.configure({ trickle: false });
NProgress.set(0.00);
NProgress.start();

$.get('load', function(data) {
    files = data.split("\n");
    files.pop();
    var percentCounter = 0;
    var total = 1;

    $.each(files, function(index, value) {
        $('<img></img>').attr('src', value)    //load image
        .load(function() {
            total++;
            percentCounter = (total / files.length) * 100;    //set the percentCounter after this image has loaded
            NProgress.set(total / files.length);
            $('#loading').text('Loading...' + Math.round(percentCounter, 2) + '% (' + files[total] + ')');
            //console.log(percentCounter + "%");
        })
    });
});
/*


function preload(arrayOfImages) {
    $(arrayOfImages).each(function () {
        $('<img />').attr('src',this).appendTo('body').css('display','none');
    });
}
*/