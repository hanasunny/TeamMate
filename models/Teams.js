var mongoose = require('mongoose');

var TeamSchema = new mongoose.Schema({
  title: String,
});

mongoose.model('Team', PostSchema);