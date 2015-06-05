var colors      = require('colors');
var exec        = require('child_process').exec;
var Table       = require('cli-table2');
var echo        = require('../console').echo;

// Called by man module
exports.man = function(cmd) {
    exports.commands[cmd].man();
    exports.commands[cmd].format();   // Somewhere in man, format should be called
}

// Command functions
function genworld(args, callback) {
    echo("\n", true);
    exec('php tools/genworld/genworld.php',
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log(error);
            } else {
                console.log(stdout);
            }
            return typeof callback === 'function' && callback(false);
        }
    );
    return {retval: false, external: true};
}

// Should have all commands that exist in this module and their respective functions
exports.commands = {
    'genworld': genworld
};
