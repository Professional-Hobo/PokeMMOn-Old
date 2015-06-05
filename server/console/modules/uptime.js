var exec = require('child_process').exec;

// Keypress events for this module here
exports.keypress = function(ch, key) {}

// TODO Called on autocomplete for a command in this module
exports.autocomplete = function(cmd, data) {
    if (!data)
        exports.commands[cmd].format();         // Somewhere in man, format should be called
    /*else {

    }*/
}

// Called by man module
exports.man = function(cmd) {
    exports.commands[cmd].format();             // Somewhere in man, format should be called
}

// Command functions
function uptime(args, callback) {
    exec('uptime',
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log("\n"+error);
            } else {
                console.log("\n"+stdout.substr(1, stdout.length-2));
            }
            console.log("PokeMMOn server uptime: 5 hours 2 minutes");
            typeof callback === 'function' && callback(false);
        }
    );
    return {retval: false, external: true};
}

function date(args, callback) {
    exec('date',
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log("\n"+error);
            } else {
                console.log("\n"+stdout.substr(0, stdout.length-1));
            }
            typeof callback === 'function' && callback(false);
        }
    );
    return {retval: false, external: true};
}

// TODO Format functions

// Should have all commands that exist in this module and their respective functions
exports.commands = {
    'uptime': uptime,
    'date': date
};
