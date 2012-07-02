var strftime = require('prettydate').strftime;
var fs = require('fs');
var db = require('./db');
var User = db.User;
var Submission = db.Submission;
var Solution = db.Solution;


module.exports = function(app) {

var title = 'Settlers Online';

var route = function(name) {
  return function(req, res) { res.render(name, { title: title }); }
};

app.get('/', route('index'));
app.get('/docs', route('docs'));
app.get('/download', route('download'));
app.get('/login', route('login'));
app.get('/submit', function(req, res) {
  if (!req.user) return res.redirect('/login');
  Submission.find({ author: req.user.id }, function(err, submissions) {
    res.render('submit', {
      title: title,
      submissions: submissions.reverse(),
      strftime: strftime
    });
  });
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

};

