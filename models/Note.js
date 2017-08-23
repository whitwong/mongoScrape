// Dependencies
var mongoose = require("mongoose");

// Note Schema Setup
var Schema = mongoose.Schema;
var NoteSchema = new Schema({
	text: {
		type: String
	}
});

// Create Note and Export
var Note = mongoose.model("Note", NoteSchema);
module.exports = Note;