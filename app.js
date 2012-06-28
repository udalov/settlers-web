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


var route = (function(title) {
  return function(name) {
    return function(req, res) { res.render(name, { title: title }); }
  }
})('Settlers');

app.get('/', route('index'));
app.get('/docs', route('docs'));
app.get('/download', route('download'));
// app.get('/submit', route('submit'));


app.listen(3010, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

