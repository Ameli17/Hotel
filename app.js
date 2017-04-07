var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var restApi = require('./routes/restApi');

var app = express();

var mongoURL = 'mongodb://fp:sfdaWRE243RD34TFWQ34@ds147900.mlab.com:47900/heroku_kkck4tr0';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/login', restApi.loginUser);
app.use('/createUser', restApi.createUser);
app.use('/createTaskType', restApi.newTaskType);
app.use('/addSubTaskType', restApi.addSubTaskType);
app.use('/getAllWorkType', restApi.getAllWorkType);
app.use('/linkTaskTypeForUser', restApi.addTasktypeForUser);
app.use('/createNewTask', restApi.createNewTask);
app.use('/getTaskForUser', restApi.getTaskForUser);
app.use('/changeTaskType', restApi.changeTaskType);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var initDb = function (callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  var mongoose = require('mongoose');
  mongoose.connect(mongoURL);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    console.log("connected to :: "+ mongoURL)
  });
};

initDb(function (err) {
  console.log('Error connecting to Mongo. Message:\n' + err);
});

module.exports = app;
