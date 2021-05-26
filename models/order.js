const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  deliveryAddress: Object,
  isCancelled: { type: Boolean, default: false },
  isDelivered: { type: Boolean, default: false },
  user: String,
  items: Array,
  date: Date,
  price: Number,
  month: Number,
  year: Number,
});

module.exports = mongoose.model("Order", orderSchema);
