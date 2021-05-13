const express = require("express");
const router = express.Router();

const Product = require("../models/product");

// "filters":{
// "season":["summer"],
// "for":["men","women"],
//   "price":{
//       "lte":"500",
//       "gte":"1500"
//   }

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
      price: price,
      sizes: sizes,
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

router.post("/filter-search", async (req, res) => {
  const filters = req.body.filters;

  const myArray = [];

  if (filters.type) {
    myArray.push({
      "filters.type": { $in: filters.type },
    });
  }
  if (filters.brand) {
    myArray.push({
      "filters.brand": { $in: filters.brand },
    });
  }
  if (filters.size) {
    myArray.push({
      "filters.sizes": { $in: filters.size },
    });
  }
  if (filters.for) {
    myArray.push({
      "filters.for": { $in: filters.for },
    });
  }
  if (filters.season) {
    myArray.push({
      "filters.season": { $in: filters.season },
    });
  }
  if (filters.price) {
    myArray.push({
      "filters.price": { $lte: filters.price.lte, $gte: filters.price.gte },
    });
  }

  const result = await Product.find(
    {
      $and: myArray,
    },
    "-filters -tags"
  );
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
    // filters:[{
    //   name:"Price",
    //   values:[
    //     {
    //       name: "Under 500",
    //       value: "52",
    //     },
    //     {
    //       name: "500 - 1000",
    //       value: "18",
    //     },
    //     {
    //       name: "1000-3000",
    //       value: "17",
    //     },
    //     {
    //       name: "3000+",
    //       value: "16",
    //     },
    //   ],
    // }],
    message: "Got data successfully",
  });
});

module.exports = router;
