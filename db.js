var config = require('./config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

mongoose.connect(config.dbLocation);

var Solution = new Schema({
    filename:     String
  , code:         Buffer
  , jar:          Buffer
  , error:        String
});

var Submission = new Schema({
    date:         { type: Date, default: Date.now }
  , solution:     ObjectId
  , author:       String
  // 0 -- not processed, 1 -- processing, 2 -- fail, 3 -- ok
  , status:       { type: Number, default: 0, min: 0, max: 3 }
});

var User = new Schema({
    _id:          String
  , name:         String
});

User.virtual('id')
  .get(function() { return this._id; })
  .set(function(id) { this._id = id; });

module.exports = {
  Solution: mongoose.model('Solution', Solution),
  Submission: mongoose.model('Submission', Submission),
  User: mongoose.model('User', User)
};

