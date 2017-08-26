/************************  APPLICATION SETUP  ************************/
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var cheerio = require("cheerio");
var request = require("request"); 

var Article = require("./models/Article.js");
var Note = require("./models/Note.js");

// Initialize Express and declare port value
var app = express();
var port = process.env.PORT || 3000;

// Static Directory
app.use(express.static("public"));

// Set mongoose to leverage built-in JS ES6 Promises
mongoose.Promise = Promise;

// Use body-parser with app
app.use(bodyParser.urlencoded({extended: false}));

// Express-Handlebars Set-up
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Database configuration with mongoose
// mongoose.connect("mongodb://localhost/mongooseScrape"); // For localhost connection
mongoose.connect("mongodb://heroku_8vfxnv7w:639gt1d12ut06sjh4jqfmojktj@ds153113.mlab.com:53113/heroku_8vfxnv7w");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error){
	console.log("Mongoose Error: ", error);
});

// Once looged in to the db through mongoose, log a success message
db.once("open", function(){
	console.log("Mongoose connection successful.");
});



/************************  ROUTES  ************************/
// Page Rendering for Articles
app.get("/", function(req, res){
	Article.find({}, function(error, data){
		res.render("index", {article: data});
	});
});

// Article Scrape
app.get("/scrape", function(req, res){
	request("https://www.reddit.com/r/todayilearned/top/", function(error, response, html){
		var $ = cheerio.load(html);
		$("a.title.may-blank.outbound").each(function(i, element){
			var result = {};
			result.title = $(this).text();
			result.link = $(this).attr("href");

			var data = new Article(result);
			data.save(function(err, doc){
				if (err){
					console.log(err);
				}
				else {
					console.log(doc);
				}
			});

		});
	});
	res.send("Scrape Complete");
});

// Get all articles saved in database
app.get("/articles", function(req, res){
	Article.find({}, function(error, doc){
		if (error){
			console.log(error);
		}
		else {
			res.json(doc)
		}
	});
});

// Get an article by it's ObjectId
app.get("/articles/:id", function(req, res){
	Article.findOne({"_id": req.params.id})
		.populate("note")
		.exec(function(error, note){
			if (error){
				console.log(error);
			}
			else{
				res.send(note);
			}
		});
});

// Add a new note
app.post("/articles/:id", function(req, res){
	var newNote = new Note(req.body);
	newNote.save(function(error, newnote){
		if (error){
			console.log(error);
		}
		else{
			Article.findByIdAndUpdate(req.params.id, {$push:{"note": newnote._id}}, { new: true }, function(err, newdoc){
				if(err){
					console.log(err);
				}
				else{
					res.send(newdoc);
				}
			})
		}
	});
});

// Route to delete notes
app.post("/notes/:id", function(req, res){
	Note.findByIdAndRemove(req.params.id, function(err, doc){
		if (err){
			console.log(err);
		}
		else{
			res.send(doc)
		}
	})
})

// Route to see JSON notes
app.get("/notes", function(req, res){
	Note.find({}, function(error, doc){
		if(error){
			res.send(error);
		}
		else{
			res.send(doc);
		}
	});
});

// Route to see Articles popluated with notes
app.get("/populatedArticles", function(req, res){
	Article.find({})
		.populate("note")
		.exec(function(error, doc){
			if (error) {
				res.send(error);
			}
			else{
				res.send(doc);
			}
		});
});

/************************  START SERVER  ************************/
app.listen(port, function(){
	console.log("App running on port " + port);
});