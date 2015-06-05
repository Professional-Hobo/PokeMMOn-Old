var colors      = require('colors');
var reqs        = require('../console').reqs;
var echo        = require('../console').echo;
var info        = require('../console').info;
var bell        = require('../console').bell;
var promptVal   = require('../console').promptVal;
var sockets     = reqs.sockets;
var usernames   = reqs.sockets;
var setBuffer   = require('../console').setBuffer;
var Table       = require('cli-table2');

// Called by man module
exports.man = function(cmd) {
    exports.commands[cmd].man();
    exports.commands[cmd].format();   // Somewhere in man, format should be called
}

// Command functions
function kick(args, callback) {
    var data   = args[1];
    var type   = "user";
    if (args.length == 1)
        return {retval: true, external: false};

    if (data.charAt(0) == "#")
        type = "conn";
    else if (data.charAt(0) == "@")
        type = "ip";
    else if (data.charAt(0) == "*")
        type = "mass";

    if (type != "user" && type != "mass")
        data = data.slice(1);

    echo('\n', true);

    var disconnect = [];

    sockets.forEach(function (socket) {
        switch (type) {
            case "conn":
                if (data == socket.conn.id)
                    disconnect.push(socket);
                break;
            case "ip":
                if (data == socket.ip)
                    disconnect.push(socket);
                break;
            case "mass":
                disconnect.push(socket);
                break;
            case "user":
            default:
                if (data == socket.session.username)
                    disconnect.push(socket);
        }
    });

    // This has to be in a seperate array because the sockets array gets resorted on every disconnect
    disconnect.forEach(function(socket) {
        info("user".green, socket.session.username + " has been kicked!");
        socket.disconnect(); // TODO use world.unloadPlayer(socket);
        echo("\033[1G", true);  // Moves cursor to beginning of line
        echo("\033[0K", true);  // Clear from cursor to end of line
    });

    return {retval: false, external: false};
}

function msg(args, callback) {
    var data   = args[1];
    var val    = args[2];
    var type   = "user";
    var msg    = [];
    if (args.length == 1)
        return {retval: true, external: false};

    if (data.charAt(0) == "#")
        type = "conn";
    else if (data.charAt(0) == "@")
        type = "ip";

    if (type != "user")
        data = data.slice(1);

    echo('\n', true);

    sockets.forEach(function (socket) {
        switch (type) {
            case "conn":
                if (data == socket.conn.id)
                    msg.push(socket);
                break;
            case "ip":
                if (data == socket.ip)
                    msg.push(socket);
                break;
            case "user":
            default:
                if (data == socket.session.username)
                    msg.push(socket);
        }
    });

    // This has to be in a seperate array because the sockets array gets resorted on every disconnect
    msg.forEach(function(socket) {
        socket.emit("msg", val); // TODO use world.unloadPlayer(socket);
        echo("\033[1G", true);  // Moves cursor to beginning of line
        echo("\033[0K", true);  // Clear from cursor to end of line
        console.log("Message to " + socket.session.username + " sent!");
    });

    return {retval: false, external: false};
}

function users(args, callback) {
    if (sockets.length == 0) {
        console.log("\nNo users connected.");
        return {retval: false, external: false};
    }

    var a = 0;
    var table = new Table({head: ['#'.white, 'User'.white, 'IP Address'.white, 'Connection ID'.white, 'Zone'.white, 'X'.white, 'Y'.white, 'Direction'.white]});

    sockets.forEach(function(user) {
        //table.push([++a, user.session.username.yellow, user.ip.green, user.conn.id.cyan, "", "", "", ""]);
        table.push([++a, user.session.username.yellow, user.ip.green, user.conn.id.cyan, players[user.session.username].pos.zone.magenta, players[user.session.username].pos.x, players[user.session.username].pos.y, players[user.session.username].pos.direction]);
    });
    console.log("\n"+table.toString());
    return {retval: false, external: false};
}

function move(args, callback) {
    var data   = args[1];
    var type   = "user";
    if (args.length == 1)
        return {retval: true, external: false};

    if (data.charAt(0) == "#")
        type = "conn";
    else if (data.charAt(0) == "@")
        type = "ip";
    else if (data.charAt(0) == "*")
        type = "mass";

    if (type != "user" && type != "mass")
        data = data.slice(1);

    echo('\n', true);

    var disconnect = [];

    sockets.forEach(function (socket) {
        switch (type) {
            case "conn":
                if (data == socket.conn.id)
                    disconnect.push(socket);
                break;
            case "ip":
                if (data == socket.ip)
                    disconnect.push(socket);
                break;
            case "mass":
                disconnect.push(socket);
                break;
            case "user":
            default:
                if (data == socket.session.username)
                    disconnect.push(socket);
        }
    });

    // This has to be in a seperate array because the sockets array gets resorted on every disconnect
    disconnect.forEach(function(socket) {
        var amt_y = 0;
        var amt_x = 0;
        var dirs = ["up", "right", "down", "left"];
        var direction = 86;
        if (inArray(args[2], ["up", "right", "down", "left"])) {
            if (args[2] == "up") {
                amt_y = -1;
                direction = 87;
            } else if (args[2] == "right") {
                amt_x = 1;
                direction = 68;
            } else if (args[2] == "down") {
                amt_y = 1;
                direction = 83;
            } else if (args[2] == "left") {
                amt_x = -1;
                direction = 65;
            }

            // Update players position
            players[socket.session.username].pos.x += amt_x;
            players[socket.session.username].pos.y += amt_y;
            players[socket.session.username].pos.direction += args[2];
            socket.emit("move", direction);
            info("user".green, "Moving " + socket.session.username + " " + args[2] + " to [" + players[socket.session.username].pos.x + ", " + players[socket.session.username].pos.y + "].");
        } else {
            if (args[2] != null && args[3] != null) {
                info("user".green, "move by coords");
            }
        }
        echo("\033[1G", true);  // Moves cursor to beginning of line
        echo("\033[0K", true);  // Clear from cursor to end of line
    });

    return {retval: false, external: false};
}

function inArray(value, array) {
  return array.indexOf(value) > -1;
}

function userAutoComplete(args) {

    var data = args[1],
        conns = [],
        ips   = [],
        users = [],
        pre = "";

    usernames.forEach(function(val) {
        conns.push(val.conn.id);
        ips.push(val.ip);
        users.push((val.session ? val.session.username : "Guest"));
    });

    // Make arrays unique
    conns = conns.filter(function(elem, pos) {
        return conns.indexOf(elem) == pos;
    });

    ips = ips.filter(function(elem, pos) {
        return ips.indexOf(elem) == pos;
    });

    users = users.filter(function(elem, pos) {
        return users.indexOf(elem) == pos;
    });

    if (data.charAt(0) == "*") {
        return {retval: false, external: false};
    }

    // ID number
    if (data.charAt(0) == "#") {
        data = data.slice(1);
        type = conns;
        pre = "#";
    } else if (data.charAt(0) == "@") {
        data = data.slice(1);
        type = ips;
        pre = "@";
    } else {
        type = users;
    }

    var matches = [];
    var tmpstr = "";
    type.forEach(function(val) {
        try {
            var reg = new RegExp("^" + data);
        } catch(e) {
            return {retval: false, external: false};
        }

        if (reg.test(val) == true)
            matches.push(val);
    });

    if (matches.length == 1) {           // 1 match so insert
        var cmd = matches[0];

        echo("\033[1G", true);           // Moves cursor to beginning of line
        echo("\033[0K", true);           // Clear from cursor to end of line
        echo(promptVal, true);           // Echo prompt
        echo(args[0] + " " + pre + cmd + " ", true); // Echo previous cmd and new
        setBuffer(args[0] + " " + pre + cmd + " ");    // Update buffer to previous cmd
    } else if (matches.length > 1) {     // Display matches to choose from
        matches.forEach(function(val) {
            tmpstr += val + ", ";
        });
        echo(tmpstr.slice(0, tmpstr.length-2));  // Echo ambiguous matches

        // Get longest string
        longest = matches.sort(function (a, b) { return b.length - a.length; })[0];
        compare = matches.sort(function (a, b) { return b.length - a.length; })[1];
        var a = 0;
        var partial = "";
        while (longest[a] == compare[a] && a < longest.length) {
            partial += longest[a++];
        };

        echo("\033[1G", true);           // Moves cursor to beginning of line
        echo("\033[0K", true);           // Clear from cursor to end of line
        echo(promptVal, true);           // Echo prompt
        echo(args[0] + " " + pre + partial, true); // Echo previous cmd and new
        setBuffer(args[0] + " " + pre + partial);    // Update buffer to previous cmd
    } else {
        bell();
        return;
    }
    return {retval: false, external: false};
}

// TODO Format functions
kick.format = function() {
    echo("kick {user | @ip | #id} [msg]", false);
};

msg.format = function() {
    echo("msg {user | @ip | #id} {msg}", false);
};

kick.autocomplete = function(args) {
    userAutoComplete(args);
    // TODO arrow keys need to be implemented for "" message cursor
    // else if (args.length == 2) {
    //     msgAutocomplete(args);
    // }
};

move.autocomplete = function(args) {
    userAutoComplete(args);
    // TODO arrow keys need to be implemented for "" message cursor
    // else if (args.length == 2) {
    //     msgAutocomplete(args);
    // }
};

msg.autocomplete = function(args) {
    userAutoComplete(args);
    // TODO arrow keys need to be implemented for "" message cursor
    // else if (args.length == 2) {
    //     msgAutocomplete(args);
    // }
};

// TODO Man functions


// Should have all commands that exist in this module and their respective functions
exports.commands = {
    'kick': kick,
    'msg': msg,
    'users': users,
    'list': users,
    'move': move
};
