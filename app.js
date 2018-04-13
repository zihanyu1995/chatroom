const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const index = require('./routes/index');
const joinCommunityController = require('./routes/joinCommunityController');
const shareStatusController = require('./routes/shareStatusController');
const chatController = require('./routes/chatController');
const postAnnouncementController = require('./routes/postAnnouncementController');
const shareLocationController = require('./routes/shareLocationController');
const addFriendController = require('./routes/addFriendController');
const helpForumController = require('./routes/helpForumController');
const voteMessageController = require('./routes/voteMessageController');
const editProfileController = require('./routes/editProfileController');

var app = express();

const Container = require('./models/container');

app.locals.container = new Container();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// setup session
app.use(session({
  secret: 'yen123321',
  resave: true,
  saveUninitialized: true,
}));

app.use('/', index);
app.use('/users', joinCommunityController);
app.use('/messages', chatController);
app.use('/users', shareStatusController);
app.use('/announcements', postAnnouncementController);
app.use('/locations', shareLocationController);
app.use('/friends', addFriendController);
app.use('/posts', helpForumController);
app.use('/vote', voteMessageController);
app.use('/admin', editProfileController);

app.use('/static', express.static('node_modules/ejs'));
app.use('/static', express.static('node_modules/socket.io-client/dist'));
app.use('/static', express.static('data'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
