const express = require("express");
const router = express.Router();
const multer = require("multer");

const Order = require("../models/order");
const User = require("../models/user");
const Home = require("../models/home");

const fs = require("fs");
const { promisify } = require("util");
const unlinkFileAsync = promisify(fs.unlink);

const fileUpload = multer({
  limits: { fileSize: 10244 * 1024 * 2.5 },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "_" + file.originalname);
    },
  }),
});

router.post("/update-order", async (req, res) => {
  const { id, oid, cancelled, delivered } = req.body;

  if (!id) {
    res.status(422).json({
      status: false,
      message: "Admin's Id not provided",
    });
    return;
  }
  if (!oid) {
    res.status(422).json({
      status: false,
      message: "Order Id not provided",
    });
    return;
  }

  let user;
  try {
    user = await User.findOne({ _id: id });
  } catch (err) {
    res.status(422).json({
      status: false,
      message: "Admin's ID is not valid",
    });
    return;
  }
  if (user.role != "admin") {
    res.status(422).json({
      status: false,
      message: "User is not admin",
    });
    return;
  }

  let result;
  try {
    result = await Order.findOne({ _id: oid });
  } catch (err) {
    res.status(422).json({
      status: false,
      message: "Order ID is not valid",
    });
    return;
  }

  if (delivered) {
    result.isDelivered = true;
  } else if (cancelled) {
    result.isCancelled = true;
  }

  result
    .save()
    .then(() => {
      res.status(200).json({
        status: true,
        message: "Order Updated successfully",
      });
    })
    .catch(() => {
      res.status(502).json({
        status: false,
        message: "Error updating order",
      });
    });
});

router.get("/orders/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(422).json({
      status: false,
      message: "Id not provided",
    });
    return;
  }

  const user = await User.findOne({ _id: id });

  if (user.role != "admin") {
    res.status(422).json({
      status: false,
      message: "User is not admin",
    });
    return;
  }

  const result = await Order.find({}, null, { sort: { date: -1 } });

  if (result.length == 0) {
    res.status(404).json({
      status: false,
      message: "No orders present",
    });
    return;
  }

  res.status(200).json({
    status: true,
    data: result,
    message: "Orders found",
  });
});

router.post("/add-home-card", fileUpload.single("image"), async (req, res) => {
  const { id, text, background, color } = req.body;
  if (!req.body.filters) {
    res.status(422).json({
      status: false,
      message: "Must provide filters.",
    });
    return;
  }
  const filters = JSON.parse(req.body.filters);

  let image;
  if (req.file) image = req.file.path;

  if (!text && !image) {
    res.status(422).json({
      status: false,
      message: "Must provide text or image.",
    });
    return;
  }

  const user = await User.findOne({ _id: id });

  if (!user) {
    if (image) await unlinkFileAsync(image);
    res.status(404).json({
      status: false,
      message: "User not found in database",
    });
    return;
  }

  if (user.role != "admin") {
    if (image) await unlinkFileAsync(image);
    res.status(401).json({
      status: false,
      message: "User do not have permission",
    });
    return;
  }

  const card = {};
  if (text) card.text = text;
  if (image) card.image = image;
  if (background) card.background = background;
  if (color) card.color = color;

  card.filters = filters;
  card.date = new Date();

  const newCard = new Home(card);

  newCard
    .save()
    .then(() => {
      res.status(201).json({
        status: true,
        message: "Created new card.",
      });
    })
    .catch(async (err) => {
      if (image) await unlinkFileAsync(image);
      res.status(502).json({
        status: false,
        message: "Error creating new Card",
        error: err,
      });
    });
});

router.post("/delete-home-card", async (req, res) => {
  const { id, cid } = req.body;
  if (!id) {
    res.status(422).json({
      status: false,
      message: "User Id not provided",
    });
    return;
  }
  if (!cid) {
    res.status(422).json({
      status: false,
      message: "Card Id not provided",
    });
    return;
  }

  const user = await User.findOne({ _id: id });

  if (!user) {
    res.status(404).json({
      status: false,
      message: "User not found in database",
    });
    return;
  }

  if (user.role != "admin") {
    res.status(401).json({
      status: false,
      message: "User do not have permission",
    });
    return;
  }

  Home.deleteOne({ _id: cid })
    .then(() => {
      res.status(200).json({
        status: true,
        message: "Card deleted",
      });
    })
    .catch((err) => {
      res.status(502).json({
        status: false,
        message: "Error deleting card",
        error: err,
      });
    });
});

router.get("/home-card", async (req, res) => {
  const result = await Home.find({}, null, { sort: { date: -1 } });
  if (result.length == 0) {
    res.status(404).json({
      status: false,
      message: "No Cards found",
    });
    return;
  }

  res.status(200).json({
    status: true,
    data: result,
    message: "Cards found",
  });
});

module.exports = router;
