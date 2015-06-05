var keypress  = require("keypress"),
    colors    = require('colors'),
    fs        = require('fs'),
    settings  = require('../../settings.json'),
    name      = settings.general.name,
    ver       = settings.general.version,
    promptVal = name.bold+" "+ver.bold+" > ".green,
    history = [],
    currentPrev = 0,
    modules = [],
    commands  = {
        'quit': quit,
        'stop': quit,
        'exit': quit,
        'history': printHistory,
        'clear': clear,
        'val': val
    },
    world = require('../app/World');

var child, buffer, currentChar, cursorPos;

Object.defineProperty(exports, "promptVal", {
    value: promptVal,
    writable: false,
    enumerable: true,
    configurable: true
});

exports.bell = bell;
exports.echo = echo;
exports.info = info;
exports.setBuffer = setBuffer;

exports.init = function init(reqs) {
    exports.reqs = reqs;
};

exports.start = function start() {
    keypress(process.stdin);    // make `process.stdin` begin emitting "keypress" events

    load();                     // Load in modules and commands
    
    // listen for the "keypress" event
    process.stdin.on("keypress", function (ch, key) {
        modules.forEach(function(module) {
            if(module.keypress)
                module.keypress(ch, key);
        });

        if (key && key.name == "return")                    // Enter
            onEnter();
        else if (key && key.name == "backspace")            // Backspace
            backspace();
        else if (key && key.sequence == "\u0003")           // Control C
            prompt(true);
        else if (!key && ch)                                // Special char ![A-Za-z0-9]. key is undefined and you have to use ch in this case.
            acceptChar(ch);
        else if (key.name == "right" || key.name == "left") // Right and left arrows to move cursor for prompt
            move(key.name);
        else if (key.name == "up")                          // Get the latest history
            histCycle("prev");
        else if (key.name == "down")                        // Go forward a command if currentPrev is within range
            histCycle("next");
        else if (key.name == "tab")                         // Auto completion
            autocomplete();
        else                                                // Have to use other chars in this case.
            if (key.ctrl == false)
                acceptChar(key.sequence);
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();
    prompt(false);
}

function onEnter() {
    if (buffer == "!!") {
        setBuffer(history[history.length-1]);
    } else if (buffer.charAt(0) == '!') {
        if (isNaN(buffer.slice(1)-1) == true || history[buffer.slice(1)-1] === undefined) {
            prompt(true);
            return;
        } else {
            setBuffer(history[buffer.slice(1)-1]);
        }
    } else if (buffer.trim() == "") {
        prompt(true);
        return;
    }

    history.push(buffer); // Add to history
    fs.appendFile(".pokeMMOn_history", buffer+"\n"); // Add to history file (.pokeMMOn_history)
    
    executeCmd(buffer, function(lineBreak) {
        prompt(lineBreak != false);
    });
}

function backspace() {
    var old = cursorPos;
    if (currentChar > 0 && cursorPos > 0) {
        echo("\033[1D", true);
        echo(' ', true);
        echo("\033[1D", true);
        if (cursorPos != buffer.length) {
            setBuffer(buffer.slice(0, cursorPos-1) + buffer.slice(cursorPos));
            cursorPos = old-1;
            echo("\033[1G", true);  // Moves cursor to beginning of line
            echo("\033[0K", true);  // Clear from cursor to end of line
            echo(promptVal, true);  // Put buffer back
            echo(buffer, true);     // Echo buffer
            echo("\033[1G", true);  // Moves cursor to beginning of line
            echo("\033["+(promptVal.length+cursorPos-28)+"C", true);  // Position cursor properly
        } else {
            setBuffer(buffer.slice(0, buffer.length-1));
        }
    } else
        bell();
}

// Cycle forwards or backwards through cmd history
function histCycle(direction) {
    var oldCmd;

    if (direction == "prev" && history.length-currentPrev > 0) {
        oldCmd = history[history.length-currentPrev-1];
        currentPrev++;
    } else if (direction == "next" && currentPrev >= 1) {
        // Make it a blank terminal if the currentPrev is 1
        oldCmd = (currentPrev == 1) ? "" : history[history.length-currentPrev+1];
        currentPrev--;
    } else {
        bell();
        return;
    }

    echo("\033[1G", true);  // Moves cursor to beginning of line
    echo("\033[0K", true);  // Clear from cursor to end of line
    echo(promptVal, true);  // Echo prompt
    echo(oldCmd, true);     // Echo previous cmd

    setBuffer(oldCmd);      // Update buffer to previous cmd
}

function autocomplete() {
    var matches = [];
    var tmpstr = "";
    var args = argsParser(buffer);
    
    Object.keys(commands).forEach(function(command) {
        try {
            var reg = new RegExp("^" + (args[0] ? args[0] : buffer));
            if (reg.test(command) == true)
                matches.push(command);
        } catch(e) {
        }
    });

    if (matches.length == 1) {  // exact match so insert
        if(args.length == 1) {
            var cmd = matches[0] + " ";

            if(commands[matches[0]].format && buffer.charAt(buffer.length - 1) == " ")
                commands[matches[0]].format();

            echo("\033[1G", true);  // Moves cursor to beginning of line
            echo("\033[0K", true);  // Clear from cursor to end of line
            echo(promptVal, true);  // Put buffer back
            echo(cmd, true);

            setBuffer(cmd);                           // Update buffer to previous cmd
        } else if(commands[matches[0]].autocomplete && matches[0] == args[0])
            commands[matches[0]].autocomplete(args);
        else
            bell();
    } else if (matches.length > 1) {  // Display matches to choose from
        matches.forEach(function(val) {
            tmpstr += val + ", ";
        });

        // Get longest string
        var sort = matches.sort(function (a, b) { return b.length - a.length; });
        longest = sort[0];
        compare = sort[sort.length-1];
        var a = 0;
        var partial = "";
        while (longest[a] == compare[a] && a < longest.length) {
            partial += longest[a++];
        };

        echo("\033[1G", true);    // Moves cursor to beginning of line
        echo("\033[0K", true);    // Clear from cursor to end of line
        echo(promptVal, true);    // Echo prompt
        echo(partial, true);      // Echo previous cmd and new
        setBuffer(partial);       // Update buffer to previous cmd
        if (args[0] == partial || args[0] == null) {
            echo(tmpstr.slice(0, tmpstr.length-2));  // Echo ambiguous matches
        }
    } else
        bell();
}

function clear() {
    echo("\033[2J", true);
    echo("\033[;H", true);
    return {retval: false, external: false};
}

function quit() {
    info("server".red, "Stopping server...\n", true);
    world.shutdown();
    process.exit(1);
}

function printHistory() {
    console.log();
    var a = 0;
    history.forEach(function (item) {
        console.log(++a+".\t"+item);
    });
    return {retval: false, external: false};
}

function val(args) {
    console.log("\n");
    console.log(global[args[1]]);
    return {retval: false, external: false};
}

function prompt(newline) {
    setBuffer("");
    currentPrev = 0;

    if (newline == true)
        echo('\n', true); 
        
    echo(promptVal, true);
}

function acceptChar(ch) {
    var reg = new RegExp(/\S| /);
    var old = cursorPos;
    if (reg.test(ch) != true)
        return;

    // Cursor isn't in front anymore so insert at cursorPos
    if (cursorPos != buffer.length) {
        setBuffer([buffer.slice(0, cursorPos), ch, buffer.slice(cursorPos)].join(''));
        cursorPos = old+1;
        echo("\033[1G", true);  // Moves cursor to beginning of line
        echo("\033[0K", true);  // Clear from cursor to end of line
        echo(promptVal, true);  // Put buffer back
        echo(buffer, true);     // Echo buffer
        echo("\033[1G", true);  // Moves cursor to beginning of line
        echo("\033["+(promptVal.length+cursorPos-28)+"C", true);  // Moves cursor to beginning of line
    } else {
        setBuffer(buffer + ch); // Add to buffer
        echo(ch, true);         // Output character
    }
}

function move(arrow) {
    if (arrow == "left") {
        if (cursorPos != 0) {
            echo("\033[1D", true);
            cursorPos--;
        }
    } else if (arrow == "right") {
        if (cursorPos < buffer.length) {
            echo("\033[1C", true);
            cursorPos++;
        }
    }
}

function bell() {
    echo('\u0007', true);
}

function argsParser(text) {
    if (!text)
        return [];

    var words = text.trim().split(" ");
    var normalized = [];

    var outer_quote = false;
    var tmp = [];
    for (var i = 0; i < words.length; i++) {
        if (!outer_quote && (words[i].charAt(0) == "\"" || words[i].charAt(0) == "\'")) {
            outer_quote = words[i].charAt(0);
            words[i] = words[i].slice(1);
        }

        if (outer_quote) {
            if (words[i])
                tmp.push(words[i]);

                if (words[i].charAt(words[i].length-1) == outer_quote) {
                    outer_quote = false;
                    var endQuote = tmp[tmp.length-1];
                    tmp[tmp.length-1] = endQuote.slice(0, endQuote.length-1);

                    normalized.push(tmp.join(" "));
                    tmp = [];
                }
        } else if (words[i])
        normalized.push(words[i]);
    }

    return normalized;
}

// Loads in all modules, commands, and history
function load() {
    fs.readdirSync("console/modules").forEach(function(val) {
        if (val.charAt(0) == ".")
            return;

        modules.push(require('./modules/' + val.slice(0, val.length-3)));

        Object.keys(modules[modules.length - 1].commands).forEach(function(key) {
            commands[key] = modules[modules.length - 1].commands[key];
        });
    });

    // Check if history file exists and if it does, read it into history
    fs.exists(".pokeMMOn_history", function (exists) {
        if (!exists){
            fs.writeFile(".pokeMMOn_history", "");
        } else {
            history = fs.readFileSync(".pokeMMOn_history").toString().split("\n");
            history.pop();
        }
    });
}

function executeCmd(buffer, callback) {
    var args = argsParser(buffer);

    if (args == null) {
        typeof callback === 'function' && callback(retval);
        return;
    }

    if (!commands[args[0]]) {
        echo("\n"+args[0]+": command not found", true);
        retval = {retval: true, external: false};
    } else {
        var retval = commands[args[0]](args, callback);    // Run command
    }

    if (retval.external == false) {
        typeof callback === 'function' && callback(retval.retval);
    }
}

function setBuffer(buf) {
    buffer = buf;
    currentChar = buffer.length;
    cursorPos = buffer.length;
}

function echo(txt, special) {
    special = typeof special !== 'undefined' ? special : false;

    // If it isn't an echo from the console, then show line and fix stdin buffer
    if (!special) {
        echo("\033[1G", true);  // Moves cursor to beginning of line
        echo("\033[0K", true);  // Clear from cursor to end of line
        echo(txt+"\n", true);   // Echo text
        echo(promptVal, true);  // Put buffer back
        echo(buffer, true);
    } else {
        process.stdout.write(txt);
    }
};

function info(type, txt, special) {
    special = typeof special !== 'undefined' ? special : false;
    if (!special) {
        echo("[" + curTime() + "][" + type + "] "+txt);
    } else {
        echo("\n[" + curTime() + "][" + type + "] "+txt, true);
    }
}

function curTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec;
}

