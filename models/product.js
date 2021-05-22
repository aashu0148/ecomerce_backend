const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  title: String,
  price: Object,
  desc: String,
  image: String,
  images: Array,
  filters: Object,
  tags: Array,
  date: Number,
});

module.exports = mongoose.model("Product", productSchema);
