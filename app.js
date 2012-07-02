var config = require('./config');
var fs = require('fs');
var everyauth = require('everyauth');
var express = require('express');
var MongoStore = require('connect-mongo')(express);
var db = require('./db');

var app = module.exports = express.createServer();

var User = db.User;
var Submission = db.Submission;
var Solution = db.Solution;

everyauth.facebook
  .appId(config.appId)
  .appSecret(config.appSecret)
  .findOrCreateUser( function(session, accessToken, accessTokenExtra, fbUserMetadata) {
    var id = 'fb' + fbUserMetadata.id;
    var promise = this.Promise();
    User.findById(id, function(err, user) {
      if (user != null)
        return promise.fulfill(user);
      var user = new User({
        _id: id,
        name: fbUserMetadata.name,
      });
      user.save(function(err) {
        if (err) return promise.fail(err);
        promise.fulfill(user);
      });
    });
    return promise;
  })
  .redirectPath('/');

everyauth.everymodule
  .findUserById( function(id, callback) {
    User.findById(id, callback);
  });

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: config.sessionSecret,
    maxAge: new Date(Date.now() + 1e14),
    store: new MongoStore(config.dbConf)
  }));
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  app.use(express.errorHandler());
});


everyauth.helpExpress(app);


var route = (function(title) {
  return function(name) {
    return function(req, res) { res.render(name, { title: title }); }
  }
})('Settlers Online');

app.get('/', route('index'));
app.get('/docs', route('docs'));
app.get('/download', route('download'));
app.get('/login', route('login'));
app.get('/submit', function(req, res) {
  if (!req.user) return res.redirect('/login');
  route('submit')(req, res);
});
app.post('/submit', function(req, res) {
  req.method = 'get';
  if (!req.user) return res.redirect('/login');
  res.redirect('/submit');
  if (!req.files || !req.files.file || !req.files.file.size) return;
  var file = req.files.file;
  fs.readFile(file.path, function(err, code) {
    if (err) throw err;
    if (!code) return;
    var solution = new Solution({
      filename: file.name,
      code: new Buffer(code)
    });
    solution.save(function(err) {
      if (err) throw err;
      var submission = new Submission({
        author: req.user._id,
        solution: solution._id
      });
      submission.save(function(err) {
        if (err) throw err;
      });
    });
  });
});

app.listen(3010, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

