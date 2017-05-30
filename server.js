var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
require('dotenv').config();
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var ejs = require('ejs');
var engine = require('ejs-mate');
var passportConf = require('./passport');
var User = require('./models/user');


var app = express();
var port = 3000;
var dbBase = 'mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@ds155150.mlab.com:55150/mongobasic';
mongoose.connect(dbBase, function(err){
  if (err) {
    console.log(err);
  }
  console.log('connected to the database');
});

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
  resave:true,
  saveUnitialized: true,
  secret: 'hamster',
  store: new MongoStore({url: dbBase, autoReconnect: true})
}));

app.get('/', function(req, res, next){
  res.render('home');
});

app.get('/login', function(req, res, next){
  if(req.user) {
    return res.redirect('/');
  }
  res.render('login');
})

app.get('/profile', function(req, res, next){
  res.render('profile');
});

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

app.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/');
});


app.post('/createuser', function(req, res, next) {
  var user = new User();
  user.email = req.body.email;
  user.password = req.body.password;
  user.save(function(err){
    if(err) {
      console.log(err);
    }
    res.json(user);
  })
});

app.listen(port, function(){
  console.log('Server started @ : ' + port);
});
