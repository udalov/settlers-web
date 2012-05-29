var express = require('express');

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  app.use(express.errorHandler());
});


(function(title) {
  app.get('/', function(req, res) { res.render('index', { title: title }); });
  app.get('/docs', function(req, res) { res.render('docs', { title: title }); });
  app.get('/download', function(req, res) { res.render('download', { title: title }); });
  // app.get('/submit', function(req, res) { res.render('submit', { title: title }); });
})('Settlers');


app.listen(3010, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

