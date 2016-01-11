var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser')();
var bodyParser   = require('body-parser');
var fs           = require('fs');
var flash        = require('connect-flash');
var compress     = require('compression');
var app          = express();

var db           = require('./models/db');
var settings     = require('./settings.json');

// Redis Session Store
var redis        = require('redis');
var session      = require('express-session');
var redisStore   = require('connect-redis')(session);

// Routes
var index = require('./routes/index');
var editor = require('./routes/editor');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// gzip compression
app.use(compress());

// Session store
app.use(cookieParser);

var sessionSettings = {
    key: settings.session.key,
    store: new redisStore(),
    secret: settings.session.secret,
    cookie: {
      path: '/'
    },
    resave: false,
    saveUninitialized: false
};

app.use(session(sessionSettings));

// Flash messages
app.use(flash());

app.use(favicon(__dirname + '/public/img/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '128mb'}));
app.use(bodyParser.urlencoded({ limit: '128mb', extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', index);
app.use('/editor', editor);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
