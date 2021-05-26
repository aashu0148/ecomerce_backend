const express = require("express");
const router = express.Router();

const Order = require("../models/order");
const User = require("../models/user");

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
