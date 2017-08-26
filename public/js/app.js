/***************** Index Page Functions *****************/
// Functions to initiate webscrape and display articles on page
function scrapeArticles() {
	$("#scrape-articles").on("click", function(){
		$.get("/scrape", function(data){
			console.log(data);
			console.log("Data scraped");
		}).then($("#doneModal").modal("toggle"));
	});	
}

function displayArticles(){
	$.get("/articles", function(){
		window.location.reload();
	})
}

$("#closeModal").on("click", function(){
	displayArticles();
});

scrapeArticles();


/////////////////////////////////////////////////////////////
// Functions to get, save, and show notes
$(document).on("click", ".see-notes", function(){
	$(".displayNotes").empty();
	var articleId = $(this).attr("data-id");
	// populate article title for notes section
	$.get("/articles/"+articleId, function(article){
		$(".article-title").html(article.title + ':')
	})

	showNotes(articleId);
	saveNote(articleId);
	deleteNote(articleId);
});

function saveNote(articleId){
	$(".save-note").off("click");
	$(".save-note").click("click", function(){
		var noteBody = $(".note-text").val().trim();
		var query = "/articles/"+articleId;

		$.post(query, {"text": noteBody}, function(note){
			$("textarea.form-control.note-text").val("");
			$(".displayNotes").empty();
			showNotes(articleId);
		})
	})
}

function showNotes(articleId) {
	var query = "/articles/"+articleId;
	$.get(query, function(singleArticle){
		$(".displayNotes").empty();
		var noteArr = singleArticle.note;
		for (var i=0; i<noteArr.length; i++){
			var showNote = $("<div class='card'>");
			showNote.append("<div class='card-block'><p class='card-text'>"+
				noteArr[i].text+"<button class='delete-note' data-id="+
				noteArr[i]._id+">Delete Note</button></p></div>");
			$(".displayNotes").append(showNote);
		}
	});
}

// Function to delete note
function deleteNote(articleId){
	$(document).on("click", ".delete-note", function(){
		var noteId = $(this).attr("data-id");
		var query = "/notes/" + noteId;
		$.post(query, function(){
			$(".displayNotes").empty();
			showNotes(articleId);
		});
	});
}