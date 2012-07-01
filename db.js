var config = require('./config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(config.dbLocation);

var Solution = new Schema({
    _id:    String
  , data:   String
});

var Submission = new Schema({
    _id:          String
  , date:         { type: Date, default: Date.now }
  , solutionId:   String
});

var User = new Schema({
    _id:          String
  , name:         String
  , submissions:  [Submission]
});

User.virtual('id')
  .get(function() { return this._id; })
  .set(function(id) { this._id = id; });

module.exports = {
  Submission: mongoose.model('Submission', Submission),
  User: mongoose.model('User', User)
};

