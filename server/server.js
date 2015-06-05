// Required modules/files
var app            = require('http').createServer(),
    settings       = require('../settings.json'),
    db             = require('./app/util/db'),
    io             = require('socket.io')(app),
    cookie         = require('cookie'),
    serverConsole  = require('./console/console'),
    colors         = require('colors'),
    redis          = require('redis'),
    session        = require('express-session'),
    redisStore     = require('connect-redis')(session),

    echo           = serverConsole.echo,
    info           = serverConsole.info,
    world          = require('./app/World');

// --------- Add session object to socket object for easy access -------- //
io.use(function(socket, next) {
    var data = socket.handshake || socket.request;
    socket.session_id = settings.session.prefix + cookie.parse(data.headers.cookie)[settings.session.key].slice(2, 34);
    db.sessionDB.get(socket.session_id, function(err, session) {
        session = JSON.parse(session);

        socket.session = session.user;
        socket.ip      = data.address;

        if(err) return next(err);

        if(!session) {
            info("user".green, "Guest has connected from " + socket.ip);
            return next(new Error("No Session Found!"));
        }

        info("user".green, socket.session.username + " has connected from " + socket.ip);
        next();
    });
});

// Multiple logins detection
io.use(function(socket, next) {
    io.sockets.sockets.forEach(function(sock) {
        if (sock.session.username == socket.session.username) {
            sock.emit('multiple logins', "You've logged in from another location.");
            world.save(sock.session.username);
            sock.disconnect();

            info("user".green, socket.session.username+" has logged in from another location.");
        }
    });
    next();
});

// --------- Add Player object to socket object for easy access -------- //

io.use(function(socket, next) {
    world.loadPlayer(socket.session.username, socket, next);
    next();
});


// --------- Set up socket events here and pass them over to the engine -------- //
io.on('connection', function(socket) {
    world.loadPlayer(socket.session.username, socket, function(player) {
        players[socket.session.username] = player;
    });

    // Load player's location
    db.models.user.findOne({username: socket.session.username}, function(err, user) {
        if (err) throw err;
        socket.emit('preData', { zone: user.zone, x: user.x, y: user.y, direction: user.direction, username: user.username, model: user.model});
    });

    // Update players location
    socket.on('locationUpdate', function(data) {
        // Update location
        players[socket.session.username].setPos(data.zone, data.x, data.y, data.direction);
    });

    socket.on('disconnect', function () {
        world.unloadPlayer(socket.session.username);
        info("user".green, socket.session.username+" has disconnected from "+socket.ip);
    });
});

serverConsole.init({
    'io': io,
    'sockets': io.sockets.sockets
});
serverConsole.start();      // Console for the game server

world.init();
world.start();              // Start the game server backend

app.listen(process.argv[2] || settings.game.port);

process.on('SIGTERM', function () {
    info("server".red, "Crash detected...attempting to save player data...\n", true);
    world.shutdown();
});
