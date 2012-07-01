var config = require('./config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

mongoose.connect(config.dbLocation);

var Solution = new Schema({
    code:   String
  , jar:    Buffer
});

var Submission = new Schema({
    date:         { type: Date, default: Date.now }
  , solution:     ObjectId
  // 0 -- not processed, 1 -- processing, 2 -- ok, 3 -- fail
  , status:       { type: Number, default: 0, min: 0, max: 2 }
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
  Solution: mongoose.model('Solution', Solution),
  Submission: mongoose.model('Submission', Submission),
  User: mongoose.model('User', User)
};

