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
        $('body').append('<div id="notify" class="modal fade" data-backdrop="">'
+                '<div class="modal-dialog">'
+                    '<div class="modal-content">'
+                        '<div class="modal-header">'
+                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
+                                '<span aria-hidden="true">&times;</span>'
+                            '</button>'
+                            '<h4 class="modal-title"></h4>'
+                        '</div>'
+                        '<div class="modal-body"></div>'
+                '</div>'
+            '</div>'
+        '</div>');
        
        var body = $('body');
        var notifyBox = $('#notify').css('color', 'black');
        var notifyTitle = $('#notify .modal-title');
        var notifyBody = $('#notify .modal-body');
        var fadeEvent;

        // Utility function for modal
        notifyBox.isVisible = function() {
            return notifyBox.hasClass('in');
        };

        // bootstrap.min.js modal is bugged, so made my own
        notifyBox.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", 
            function() {
                if(!notifyBox.isVisible()) {
                    notifyBox.hide();
                }
            });

        notifyBox.modal = function(action) {
            if(action == 'hide') {
                notifyBox.removeClass('in');
                body.removeClass('modal-open');
            } else if(action == 'show') {
                if(notifyBox.css('display') != 'none' && !notifyBox.isVisible()) {
                    setTimeout(function() {
                        notifyBox.modal('show')
                    }, 25);
                } else {
                    notifyBox.show();
                    notifyBox.css('display');   // Hack needed to trigger transition
                    notifyBox.addClass('in');
                    body.addClass('modal-open');
                }
            }
        }

        // Hides notification if you click anywhere
        $(document).on('click', function() {
            if(notifyBox.isVisible()) {
                notifyBox.modal('hide');
            }
        });

        //
        // Activates notification with relevant message
        // @fade Time in milliseconds until notification fades
        //
        this.notify = function notify(title, msg, fade) {
            // Hide prev notification and clear prev hide event
            clearTimeout(fadeEvent);
            notifyBox.modal('hide');

            // Load in message
            notifyTitle.html(title);
            notifyBody.html(msg);

            // Print out to console in case message
            // disappears too fast
            console.log('---------- Notification -----------');
            console.log('Title: ' + title.replace(/(<([^>]+)>)/ig, ''));
            console.log('Message: ' + msg.replace(/(<([^>]+)>)/ig, ''));
            
            // Appear!
            notifyBox.modal('show');

            // Disappear again
            fadeEvent = setTimeout(function() {
                notifyBox.modal('hide');
            }, fade ? fade : 3500);
        }

        //
        // Set up AJAX loading animations and notifications
        //
        $('body').prepend('<div id="loader"></div>');
        var loader = $('#loader');

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

        // AJAX requests are async, so this displays one message for them all
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

