$(function() {
    window.UI = new (function() {
        //
        // Adjust sidebar and sidebar tab widths
        //
        var tabs = $('.sidebar .tab-container .tab').length;
        $('.sidebar .tab-container').width(tabs * 100 + '%');
        $('.sidebar .tab-container .tab').width(100/tabs + '%');

        //
        // Update Menu with current mode and enable mode change animations
        //
        if(window.location.hash) {
            $('.dropdown-toggle .mode').text($('a[href='+window.location.hash+']').text());
        }
        $('body').on('click', '.header .dropdown .dropdown-menu > *', function(e) {
            var scale = -100/tabs * $(this).index();

            $('.tab-container').css('transform', 'translateX(' + scale + '%)');
            $('.dropdown-toggle .mode').text($(this).text());
            e.preventDefault();
        });

        //
        // 0-9 is mapped to different modes. Enables quick switching
        // between modes by pressing 0-9
        //
        var modes = $('.header li[data-tab] a').toArray().map(function(e) {return $(e)});

        window.addEventListener('keydown', function(e) {
            if(e.which >= 48 && e.which <= 57) {
                if(modes.length >= e.which - 49) {
                    modes[(e.which - 49)].click();
                } else {
                    modes[modes.length-1].click();
                }
            } 
        });

        //
        // Activates alert message with message type and message contents
        //
        this.notify = function notify(type, msg) {

        }

        //
        // Load in other UI modules. Other UI module filenames should follow a convention
        // where the filename is <href value of link for module>-ui.js
        //
        $.ajaxSetup({cache: true});
        modes.forEach(function(e) {$.getScript('/js/editor/'+e.attr('href').slice(1)+'-ui.js')});
    })();
});

