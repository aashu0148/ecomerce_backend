const express = require("express");
const router = express.Router();

const Order = require("../models/order");
const User = require("../models/user");

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

module.exports = router;
