var config = require('./config');
var everyauth = require('everyauth');
var express = require('express');
var MongoStore = require('connect-mongo')(express);

var app = module.exports = express.createServer();

var db = require('./db');
var User = db.User;

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

require('./routes')(app);

app.listen(3010, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

