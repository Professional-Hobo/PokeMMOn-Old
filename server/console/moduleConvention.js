// Private variables for this module
var private_var = "blah";
var otherPrivate = require('example');

// Keypress events for this module here
exports.keypress = function(ch, key) {}

// Called on autocomplete for a command in this module
exports.autocomplete = function(cmd, data) {
    if(!data)
        exports.commands[cmd].format();   // Somewhere in man, format should be called
    else {

    }
}

// Called by man module
exports.man = function(cmd) {
    exports.commands[cmd].format();   // Somewhere in man, format should be called
}

// Command functions
function example1() {
    this.format = function format() {};        // This displays the format for the command

    return retval;
};

function example2() {
    this.format = function format() {};

    return retval;
};


// Should have all commands that exist in this module and their respective functions
exports.commands = {
    'example1': example1,
    'example2': example2
};
