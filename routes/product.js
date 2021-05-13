const express = require("express");
const router = express.Router();

const Product = require("../models/product");

// brand | price | for(men,women,children) | size | type(casual,formal) | season(summer,winter,both)

router.post("/add", (req, res) => {
  const { title, price, image, sizes, size, desc, images, filters, tags } =
    req.body;
  if (
    !(title && price && sizes && size && images && desc && image && filters)
  ) {
    res.status(422).json({
      status: false,
      message: "All fields are mandetory",
    });
    return;
  }
  const newProduct = new Product({
    title,
    price,
    sizes,
    size,
    desc,
    image,
    images,
    filters: {
      type: filters.type,
      season: filters.season,
      for: filters.for,
      brand: filters.brand,
    },
    tags,
  });

  newProduct
    .save()
    .then(() => {
      res.status(201).json({
        status: true,
        message: "Entry created",
      });
    })
    .catch((err) => {
      res.status(502).json({
        status: false,
        message: `Error creating Entry`,
        error: err,
      });
    });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  Product.deleteOne({ _id: id })
    .then(() => {
      res.status(200).json({
        status: true,
        message: "Entry deleted successfully",
      });
    })
    .catch(() => {
      res.status(502).json({
        status: false,
        message: "Error deleting Entry",
      });
    });
});

router.get("/search/:query", async (req, res) => {
  const query = req.params.query;
  const result = await Product.find({
    $or: [
      {
        tags: new RegExp(query, "ig"),
      },
      {
        title: new RegExp(query, "ig"),
      },
    ],
  });
  if (result.length == 0) {
    res.status(404).json({
      status: false,
      message: "Nothing Found !",
    });
    return;
  }
  res.status(200).json({
    status: true,
    data: result,
    message: "Got data successfully",
  });
  return;
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Place.find({ _id: id }, "-filters -tags");
    if (result == 0) {
      res.status(404).json({
        status: false,
        message: "Nothing Found !",
      });
      return;
    }
    res.status(200).json({
      status: true,
      message: "Got data successfully",
      data: result,
    });
  } catch (err) {
    res
      .status(404)
      .json({ status: false, message: "Error Occured", error: err });
  }
});

router.get("/", async (req, res) => {
  const result = await Product.find({}, "-filters -tags");
  if (result.length == 0) {
    res.status(404).json({
      status: false,
      message: "Nothing Found !",
    });
    return;
  }
  res.status(200).json({
    status: true,
    data: result,
    message: "Got data successfully",
  });
});

module.exports = router;
