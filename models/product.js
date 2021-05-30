const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  title: String,
  price: {
    s: Number,
    m: Number,
    l: Number,
    xl: Number,
    xxl: Number,
    6: Number,
    7: Number,
    8: Number,
    9: Number,
    10: Number,
    11: Number,
    12: Number,
    13: Number,
  },
  desc: String,
  image: String,
  images: Array,
  sizes: Array,
  filters: Object,
  tags: Array,
  date: Number,
});

module.exports = mongoose.model("Product", productSchema);
