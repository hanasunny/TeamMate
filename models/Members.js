var mongoose = require('mongoose')

var MemberSchema = new mongoose.Schema({
	name: String,
	id: String,
	profile: String,
	teams: []
})

mongoose.model('Member', MemberSchema)