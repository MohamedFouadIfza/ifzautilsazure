var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cron = require('node-cron')
var app = express();

var MedicalTest = require('./API/medicaltest')
var Portal = require('./API/portal')
var Desk = require('./API/desk')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

// app.use(express.json({ limit: '50mb',  }));
// app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 500000 }));


app.use('/api', MedicalTest);
app.use('/api', Portal);
app.use('/api', Desk);

cron.schedule("00 01 07 * * *", () => {
  console.log("function run from app.js")
  deleteFilesFromFolder(outputFolder, () => {
      console.log("delted")
  })
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
