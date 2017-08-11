// Require mongoose
var mongoose = require("mongoose");

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

// Make LibrarySchema a Schema
var EspnSchema = new Schema({
  // name: a unique string
  title: {
    type: String,
    unique: true
  },
  link: {
      type: String
  },
  note: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// Save the  model using the LibrarySchema
var Espn = mongoose.model("Espn", EspnSchema);

// Export the  model
module.exports = Espn;