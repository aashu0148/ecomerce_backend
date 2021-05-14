const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const secretKey = require("../secret");

router.post("/token-signin", async (req, res) => {
  const token = req.body.token;
  let email, password;
  jwt.verify(token, secretKey, (err, data) => {
    if (err) {
      res.status(422).json({
        status: false,
        message: "Token Invalid",
      });
      return;
    }
    email = data.email;
    password = data.password;
  });

  const result = await User.findOne(
    { email: email, password: password },
    "-password"
  );

  if (!result) {
    res.status(404).json({
      status: false,
      message: "User not Found",
    });
    return;
  }

  res.status(200).json({
    status: true,
    data: result,
    message: "User Found",
  });
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const result = await User.findOne(
    { email: email, password: password },
    "-password"
  );

  if (!result) {
    res.status(404).json({
      status: false,
      message: "User not Found",
    });
    return;
  }

  res.status(200).json({
    status: true,
    data: result,
    message: "User Found",
  });
});

router.post("/signup", async (req, res) => {
  const { name, email, mobile, password } = req.body;
  if (!name) {
    res.status(422).json({
      status: false,
      message: "name is mandatory",
    });
    return;
  }
  if (!password || password.length < 5) {
    res.status(422).json({
      status: false,
      message: "Invalid Password",
    });
    return;
  }
  if (mobile.length != 10) {
    res.status(422).json({
      status: false,
      message: "Invalid Mobile number",
    });
    return;
  }
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailRegex.test(email.toLowerCase())) {
    res.status(422).json({
      status: false,
      message: "Invalid Email",
    });
    return;
  }

  const result = await User.findOne({ email: email }, "-password");
  if (result) {
    res.status(422).json({
      status: false,
      message: "Email already in use. Please Signin",
    });
    return;
  }
  const newUser = new User({
    name,
    email,
    mobile,
    password,
    cart: [],
  });

  newUser
    .save()
    .then(() => {
      res.status(201).json({
        status: true,
        message: "User created",
      });
    })
    .catch((err) => {
      res.status(502).json({
        status: false,
        message: `Error creating new User`,
        error: err,
      });
    });
});

module.exports = router;
