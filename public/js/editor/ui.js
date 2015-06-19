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
        // Enum used by notify function.
        // Denotes what type of notification to make.
        //
        this.NOTIFY = Object.freeze({
            SUCCESS: 1,
            INFO: 2,
            WARNING: 3,
            DANGER: 4
        });

        //
        // Generates notification HTML
        //
        $('body').prepend('<div id="notify"></div>');
        var notifyBox = $('#notify').css({
            position: 'absolute',
            top: '-200px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '999',
            transition: 'all .5s ease'
        }).addClass('alert');

        notifyBox.on('click', function(e) {
            $(this).slideUp();
            e.preventDefault();
        });

        //
        // Activates alert message with message type and message contents
        //
        this.notify = function notify(type, msg) {
            // Reset the previous alert type
            notifyBox.attr('class', 'alert');

            switch(type) {
                case this.NOTIFY.SUCCESS:
                    notifyBox.addClass('alert-success');
                    break;
                case this.NOTIFY.INFO:
                    notifyBox.addClass('alert-info');
                    break;
                case this.NOTIFY.WARNING:
                    notifyBox.addClass('alert-warning');
                    break;
                case this.NOTIFY.DANGER:
                    notifyBox.addClass('alert-danger');
                    break;
            }

            // Load in message
            notifyBox.text(msg);
            
            // Appear!
            notifyBox.css('top', '200px');

            // Disappear again
            setTimeout(function() {
                notifyBox.css({
                    top: '-200px'
                });
            }, 1500);
        }

        //
        // Set up AJAX loading animations
        //
        $('body').prepend('<div id="loader"></div>');
        var loader = $('#loader').css({
            position: 'fixed',
            top: '0',
            left: '0',
            background: '#4A90E2',
            height: '3px',
            width: '0',
            zIndex: '500',
            transition: 'all .15s ease'
        });

        $.ajaxSetup({
            cache: true,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();

                //Upload progress
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        loader.width(evt.loaded/evt.total * 100 + '%');
                    }
                });

                //Download progress
                xhr.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        loader.width(evt.loaded/evt.total * 100 + '%');
                    }
                });

                return xhr;
            }
        });

        $(document).ajaxSuccess(function(e, jqXHR) {
            loader.css('width', '100%');
        });

        $(document).ajaxError(function(e, jqXHR, settings, err) {
            //notify(, err);
        });

        $(document).ajaxComplete(function(e, jqXHR) {
            loader.fadeOut(400, function(){
                loader.width(0).show(0);
            });
        });

        //
        // Load in other UI modules. Other UI module filenames should follow a convention
        // where the filename is <href value of link for module>-ui.js
        //
        modes.forEach(function(e) {$.getScript('/js/editor/'+e.attr('href').slice(1)+'-ui.js')});
    })();
});

