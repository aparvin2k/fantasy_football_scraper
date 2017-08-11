// Require mongoose
var mongoose = require("mongoose");

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

// Make LibrarySchema a Schema
var ProfootballSchema = new Schema({
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
var Profootball = mongoose.model("Profootball", ProfootballSchema);

// Export the  model
module.exports = Profootball;