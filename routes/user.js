const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const secretKey = require("../secret");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "buildforfb@gmail.com",
    pass: "jjwobwqchnzxqeir",
  },
  // host: "smtp.gmail.com",
  // port: 587,
  // secure: false,
  // requireTLS: true,
  // auth: {
  //   user: "buildforss@gmail.com",
  //   pass: <your original pass>,
  // },
});
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
    role: "user",
    name,
    email,
    mobile,
    password,
    cart: [],
    orders: [],
  });

  newUser
    .save()
    .then((response) => {
      res.status(201).json({
        status: true,
        message: "User created",
        data: {
          id: response._id,
          name: response.name,
          email: response.email,
          mobile: response.mobile,
        },
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

router.post("/update-profile", async (req, res) => {
  const { id, name, mobile } = req.body;
  const result = await User.findOne({ _id: id }, "-password");

  if (!result) {
    res.status(404).json({
      status: false,
      message: "User not Found",
    });
    return;
  }

  if (!name) {
    res.status(422).json({
      status: false,
      message: "name field is missing",
    });
    return;
  }

  if (!mobile) {
    res.status(422).json({
      status: false,
      message: "mobile field is missing",
    });
    return;
  }

  result.name = name;
  result.mobile = mobile;
  result
    .save()
    .then(() => {
      res.status(200).json({
        status: true,
        message: "Updated successfully",
      });
    })
    .catch((err) => {
      res.status(502).json({
        status: false,
        message: `Error updating User`,
        error: err,
      });
    });
});

router.post("/check-role", async (req, res) => {
  const { id } = req.body;
  const result = await User.findOne({ _id: id }, "-password");

  if (!result) {
    res.status(404).json({
      status: false,
      message: "User not found",
    });
    return;
  }
  if (result.role != "admin") {
    res.status(422).json({
      status: false,
      message: "User is not admin",
    });
    return;
  }
  res.status(200).json({
    status: true,
    message: "Welcome Admin",
  });
});

router.post("/place-order", async (req, res) => {
  const { id, deliveryAddress, paymentMethod, order } = req.body;

  if (
    !deliveryAddress.name ||
    !deliveryAddress.email ||
    !deliveryAddress.mobile ||
    !deliveryAddress.address ||
    !deliveryAddress.city ||
    !deliveryAddress.state ||
    !order
  ) {
    res.status(422).json({
      status: false,
      message: "Insufficient delivery Information",
    });
    return;
  }

  const result = await User.findOne({ _id: id }, "-password");

  result.orders.push(order);
  result.cart = [];
  result
    .save()
    .then(() => {
      const mailOptionsUser = {
        to: deliveryAddress.email,
        subject: "Thankyou for placing order.",
        text: `Your order has been placed. Thank you for shopping with us.
        
        Your order details :-
        ${order
          .map(
            (item) => `
        Item -${item.name}
        Quantity - ${item.qty}
        `
          )
          .join("\n")}
        
        `,
      };
      const mailOptionsAdmin = {
        to: "buildforfb@gmail.com",
        subject: "One order recieved",
        text: `
        Name - ${deliveryAddress.name}
        Email - ${deliveryAddress.email}
        Mobile number - ${deliveryAddress.mobile}
        Address - ${deliveryAddress.address}
        City - ${deliveryAddress.city}
        State - ${deliveryAddress.state}
        Payment - ${paymentMethod}

        
        Order :- ${order
          .map(
            (item) => `
        Item -${item.name}
        Quantity - ${item.qty}
        Size - ${item.size}
        Price - ₹${item.price}
        `
          )
          .join("\n")}
        `,
      };

      transporter.sendMail(mailOptionsUser, (err, info) => {
        console.log(err, info);
      });
      transporter.sendMail(mailOptionsAdmin, (err, info) => {
        console.log(err, info);
      });
      res.status(200).json({
        status: true,
        message: "Order placed successfully",
      });
    })
    .catch((err) => {
      res.status(502).json({
        status: false,
        message: `Error placing Order`,
        error: err,
      });
    });
});

module.exports = router;
