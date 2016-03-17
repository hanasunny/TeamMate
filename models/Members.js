var mongoose = require('mongoose')

var MemberSchema = new mongoose.Schema({
	name: String,
	profile: String
})

mongoose.model('Member', MemberSchema)