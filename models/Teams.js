var mongoose = require('mongoose');

var TeamSchema = new mongoose.Schema({
  title: String,
  creator: String,
  dateCreated: { type: Date, default: Date.now },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }]
});

mongoose.model('Team', TeamSchema);