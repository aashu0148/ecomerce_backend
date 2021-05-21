const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  title: String,
  price: Number,
  size: String,
  sizes: Array,
  desc: String,
  image: String,
  images: Array,
  filters: Object,
  tags: Array,
  date: Number,
});

module.exports = mongoose.model("Product", productSchema);
