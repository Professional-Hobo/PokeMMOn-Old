$(function() {
    window.UI = new (function() {
        var self = this;

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
        // Generates notification HTML
        //
        $('body').append('<div id="notify" class="modal fade">'
+                '<div class="modal-dialog">'
+                    '<div class="modal-content">'
+                        '<div class="modal-header">'
+                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
+                            '<h4 class="modal-title"></h4>'
+                        '</div>'
+                        '<div class="modal-body"></div>'
+                '</div>'
+            '</div>'
+        '</div>');
        
        var notifyBox = $('#notify').css('color', 'black');
        var notifyTitle = $('#notify .modal-title');
        var notifyBody = $('#notify .modal-body');

        //
        // Activates notification with relevant message
        // @fade Time in milliseconds until notification fades
        //
        this.notify = function notify(title, msg, fade) {
            // Load in message
            notifyTitle.html(title);
            notifyBody.html(msg);
            
            // Appear!
            notifyBox.modal('show');

            // Disappear again
            setTimeout(function() {
                notifyBox.modal('hide');
            }, 5000);
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

        var failed = [];
        var succeeded = [];

        $(document).ajaxSuccess(function(e, jqXHR, settings) {
            loader.css('width', '100%');
            succeeded.push(settings.url);
        });

        $(document).ajaxError(function(e, jqXHR, settings, err) {
            failed.push(settings.url)
        });

        $(document).ajaxStop(function() {
            var msg = '';

            if(succeeded.length) {
                msg += 'Succeeded in loading:<br>' +
                        '<ul><li>' + succeeded.join('</li><li>') + '</li></ul>';
                succeeded = [];
            }

            if(failed.length) {
                msg += 'Failed to load:<br>' +
                        '<ul><li>' + failed.join('</li><li>') + '</li></ul>';
                failed = [];
            }

            self.notify('AJAX Status', msg);
        });

        $(document).ajaxComplete(function() {
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

