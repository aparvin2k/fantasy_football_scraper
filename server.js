// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");
var methodOverride = require("method-override");
// Requiring our Note and Article models
var Note = require("./models/note.js");
var Rotoworld = require("./models/rotoworld.js");
var Profootball = require("./models/profootball.js");
var Cbs = require("./models/cbs.js");
var Espn = require("./models/espn.js");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

// Use body parser with our app
app.use(bodyParser.urlencoded({
  extended: false
}));

// override with POST having ?_method=PUT
app.use(methodOverride('_method'));

// Make public a static dir
app.use(express.static("./public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.set('views', __dirname + '/views');
app.engine("handlebars", exphbs({ defaultLayout: "main", layoutsDir: __dirname + "/views/layouts" }));
app.set("view engine", "handlebars");

// Database configuration with mongoose

var databaseUri = "mongodb://localhost/fantasyfootballscrape";
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseUri);
}
var db = mongoose.connection;

/*mongoose.connect("mongodb://heroku_dnbl2f3n:etrnrrvnoe7m1qmtae0jret6ss@ds111882.mlab.com:11882/heroku_dnbl2f3n");
var db = mongoose.connection;*/

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

//=========Routes==========//

app.get("/", function (req, res) {
  Rotoworld.find({})
    .exec(function (error, data) {
      if (error) {
        res.send(error);
      }
      else {
        var newsObj = {
          Rotoworld: data
        };
        res.render("index", newsObj);
      }
    });
});

app.get("/profootball", function (req, res) {
  Profootball.find({})
    .exec(function (error, data) {
      if (error) {
        res.send(error);
      }
      else {
        var newsObj = {
          Profootball: data
        };
        res.render("profootball", newsObj);
      }
    });
});

app.get("/espn", function (req, res) {
  Espn.find({})
    .exec(function (error, data) {
      if (error) {
        res.send(error);
      }
      else {
        var newsObj = {
          Espn: data
        };
        res.render("espn", newsObj);
      }
    });
});

app.get("/cbs", function (req, res) {
  Cbs.find({})
    .exec(function (error, data) {
      if (error) {
        res.send(error);
      }
      else {
        var newsObj = {
          Cbs: data
        };
        res.render("cbs", newsObj);
      }
    });
});

// A GET request to scrape the nhl/oilers website
app.get("/scrapeRoto", function(req, res) {
  // First, we grab the body of the html with request
  Rotoworld.collection.remove();

  request("http://www.rotoworld.com/headlines/nfl/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $(".player").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      result.link = $(this).children("a").attr("href");
      // console.log(result.title);
      // console.log(result.link);

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Rotoworld(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
    res.redirect("/");
    console.log("Successfully Scraped");
  });
});

app.get("/scrapeProfootball", function(req, res) {
  // First, we grab the body of the html with request
  Profootball.collection.remove();
  
  request("https://www.profootballfocus.com/news/category/news", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("h5").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      result.link = $(this).parent("a").attr("href");
      // console.log(result.title);
      // console.log(result.link);

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Profootball(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
    res.redirect("/profootball");
    console.log("Successfully Scraped");
  });
});

app.get("/scrapeEspn", function(req, res) {
  // First, we grab the body of the html with request
  Espn.collection.remove();
  
  request("http://www.espn.com/blog/nflinjurywire/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $(".news-feed-item").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      result.link = $(this).children("a").attr("href");
      // console.log(result.title);
      // console.log(result.link);

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Espn(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
    res.redirect("/espn");
    console.log("Successfully Scraped");
  });
});

app.get("/scrapeCbs", function(req, res) {
  // First, we grab the body of the html with request
  Cbs.collection.remove();
  
  request("https://www.cbssports.com/fantasy/football/players/news/all/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("h4").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      result.link = $(this).children("a").attr("href");
      console.log(result.title);
      console.log(result.link);

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Cbs(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
    res.redirect("/cbs");
    console.log("Successfully Scraped");
  });
});

// Creating notes for Rotoworld
app.post("/notes/:id", function (req, res) {
  var newNote = new Note(req.body);
  newNote.save(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("this is the DOC " + doc);
      Rotoworld.findOneAndUpdate({
        "_id": req.params.id
      },
        { $push: { "note": doc._id } }, {new: true},  function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log("note saved: " + doc);
            res.redirect("/notes/" + req.params.id);
          }
        });
    }
  });
});

app.get("/notes/:id", function (req, res) {
  console.log("This is the req.params: " + req.params.id);
  Rotoworld.find({
    "_id": req.params.id
  }).populate("note")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        var notesObj = {
          Rotoworld: doc
        };
        console.log(notesObj);
        res.render("notes", notesObj);
      }
    });
});

// Creating Notes for Espn
app.post("/espnNotes/:id", function (req, res) {
  var newNote = new Note(req.body);
  newNote.save(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("this is the DOC " + doc);
      Espn.findOneAndUpdate({
        "_id": req.params.id
      },
        { $push: { "note": doc._id } }, {new: true},  function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log("note saved: " + doc);
            res.redirect("/espnNotes/" + req.params.id);
          }
        });
    }
  });
});

app.get("/espnNotes/:id", function (req, res) {
  console.log("This is the req.params: " + req.params.id);
  Espn.find({
    "_id": req.params.id
  }).populate("note")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        var notesObj = {
          Espn: doc
        };
        console.log(notesObj);
        res.render("espnNotes", notesObj);
      }
    });
});

// Creating Notes for CBS Sports
app.post("/cbsNotes/:id", function (req, res) {
  var newNote = new Note(req.body);
  newNote.save(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("this is the DOC " + doc);
      Cbs.findOneAndUpdate({
        "_id": req.params.id
      },
        { $push: { "note": doc._id } }, {new: true},  function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log("note saved: " + doc);
            res.redirect("/cbsNotes/" + req.params.id);
          }
        });
    }
  });
});

app.get("/cbsNotes/:id", function (req, res) {
  console.log("This is the req.params: " + req.params.id);
  Cbs.find({
    "_id": req.params.id
  }).populate("note")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        var notesObj = {
          Cbs: doc
        };
        console.log(notesObj);
        res.render("cbsNotes", notesObj);
      }
    });
});

// Creating Notes for Profootball
app.post("/profootballNotes/:id", function (req, res) {
  var newNote = new Note(req.body);
  newNote.save(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("this is the DOC " + doc);
      Profootball.findOneAndUpdate({
        "_id": req.params.id
      },
        { $push: { "note": doc._id } }, {new: true},  function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log("note saved: " + doc);
            res.redirect("/profootballNotes/" + req.params.id);
          }
        });
    }
  });
});

app.get("/profootballNotes/:id", function (req, res) {
  console.log("This is the req.params: " + req.params.id);
  Profootball.find({
    "_id": req.params.id
  }).populate("note")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        var notesObj = {
          Profootball: doc
        };
        console.log(notesObj);
        res.render("profootballNotes", notesObj);
      }
    });
});

// Creating the delete action
app.get("/delete/:id", function (req, res) {
  Note.remove({
    "_id":req.params.id
  }).exec(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("note deleted");
      res.redirect("/" );
    }
  });
});

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on PORT" + PORT + "!");
});
