const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  title: String,
  price: {
    s:Number,
    m:Number,
    l:Number,
    xl:Number,
    xxl:Number,
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
