const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  title: String,
  price: Object,
  size: String,
  sizes: Array,
  desc: String,
  image: String,
  images: Array,
  filters: Object,
  tags: Array,
});

module.exports = mongoose.model("Product", productSchema);
