// Dependencies
var mongoose = require("mongoose");

// Mongo Schema Setup
var Schema = mongoose.Schema;
var ArticleSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	link: {
		type: String,
		required: true
	},
	note: [{
		type: Schema.Types.ObjectId,
		ref: "Note"
	}]
});

// Create Article and Export
var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;