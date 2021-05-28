const mongoose = require("mongoose");

const homeSchema = mongoose.Schema({
  text: String,
  image: String,
  filters: Object,
  background: String,
  color: String,
  date: Date,
});

module.exports = mongoose.model("HomeCard", homeSchema);
