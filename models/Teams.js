var mongoose = require('mongoose');

var TeamSchema = new mongoose.Schema({
  title: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }]
});

mongoose.model('Team', TeamSchema);