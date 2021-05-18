const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: String,
  role: String,
  mobile: String,
  email: String,
  password: String,
  cart: Array,
  orders: Array,
});

module.exports = mongoose.model("User", userSchema);
