const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const mongoUri = require("./mongoUri");

const productRoute = require("./routes/product");
const userRoute = require("./routes/user");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use(bodyParser.json());

app.use("/product", productRoute);
app.use("/user", userRoute);

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected");
    app.listen(process.env.PORT || 5000);
  })

  .catch((err) => {
    console.error("Cannot connect.", err);
  });
