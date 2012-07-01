var config = require('./config');
var everyauth = require('everyauth');
var express = require('express');
var MongoStore = require('connect-mongo')(express);

var app = module.exports = express.createServer();

everyauth.facebook
  .appId(config.appId)
  .appSecret(config.appSecret)
  .findOrCreateUser( function(session, accessToken, accessTokenExtra, fbUserMetadata) {
    // TODO
    return { id: fbUserMetadata.id };
  })
  .redirectPath('/');

everyauth.everymodule
  .findUserById( function(userId, callback) {
    // TODO
    callback(null, { name: "Batman", id: userId });
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
})('Settlers');

app.get('/', route('index'));
app.get('/docs', route('docs'));
app.get('/download', route('download'));
app.get('/login', route('login'));
app.get('/submit', function(req, res) {
  if (req.user)
    return route('submit')(req, res);
  res.redirect('/login');
});

app.listen(3010, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

