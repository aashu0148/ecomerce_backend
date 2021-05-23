const express = require("express");
const router = express.Router();
const multer = require("multer");

const fs = require("fs");
const { promisify } = require("util");
const unlinkFileAsync = promisify(fs.unlink);

const Product = require("../models/product");
const User = require("../models/user");

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

// "filters":{
// "season":["summer"],
// "for":["men","women"],
//   "price":{
//       "lte":"500",
//       "gte":"1500"
//   },
//  type:["footware","topwear","bottomwear"]
// }

router.post(
  "/add",
  fileUpload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "image",
      maxCount: 3,
    },
  ]),
  async (req, res) => {
    const { uid, title, desc } = req.body;
    const price = JSON.parse(req.body.price);
    const filters = JSON.parse(req.body.filters);
    const tags = JSON.parse(req.body.tags);

    if (!uid) {
      res.status(422).json({
        status: false,
        message: "User's Id not provided",
      });
      return;
    }

    if (!req.files.thumbnail) {
      res.status(422).json({
        status: false,
        message: "Thumbnail not provided",
      });
      return;
    }

    const image = req.files.thumbnail[0].path;
    const images = [image];
    if (req.files.image)
      req.files.image.forEach((item) => images.push(item.path));

    if (!(title && price && desc && filters)) {
      images.forEach(async (item) => {
        await unlinkFileAsync(item);
      });
      res.status(422).json({
        status: false,
        message: "All fields are mandetory",
      });
      return;
    }
    let result;
    try {
      result = await User.findOne({ _id: uid }, "-password");
    } catch {
      () => {
        res.status(422).json({
          status: false,
          message: "Invalid id",
        });
      };
    }
    if (!result) {
      images.forEach(async (item) => {
        await unlinkFileAsync(item);
      });
      res.status(422).json({
        status: false,
        message: "User not found in our database",
      });
      return;
    }

    if (result.role != "admin") {
      images.forEach(async (item) => {
        await unlinkFileAsync(item);
      });
      res.status(422).json({
        status: false,
        message: "User do not have permission",
      });
      return;
    }

    const newProduct = new Product({
      title,
      price,
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
      date: Date.now(),
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
        images.forEach(async (item) => {
          await unlinkFileAsync(item);
        });
        res.status(502).json({
          status: false,
          message: `Error creating Entry`,
          error: err,
        });
      });
  }
);
router.post(
  "/update",
  fileUpload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "image1",
      maxCount: 1,
    },
    {
      name: "image2",
      maxCount: 1,
    },
    {
      name: "image3",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    const { uid, pid, title, desc } = req.body;
    const price = JSON.parse(req.body.price);
    
        let thumbnail, image1, image2, image3;
    
        if (req.files.thumbnail) thumbnail = req.files.thumbnail[0].path;
        if (req.files.image1) image1 = req.files.image1[0].path;
        if (req.files.image2) image2 = req.files.image2[0].path;
        if (req.files.image3) image3 = req.files.image3[0].path;
    
    if (!uid) {
      if(thumbnail)
      await unlinkFileAsync(thumbnail);
      if(image1)
      await unlinkFileAsync(image1);
      if(image2)
      await unlinkFileAsync(image2);
      if(image3)
      await unlinkFileAsync(image3);
    
      res.status(422).json({
        status: false,
        message: "User's Id not provided",
      });
      return;
    }
    if (!pid) {
      if(thumbnail)
      await unlinkFileAsync(thumbnail);
      if(image1)
      await unlinkFileAsync(image1);
      if(image2)
      await unlinkFileAsync(image2);
      if(image3)
      await unlinkFileAsync(image3);
      res.status(422).json({
        status: false,
        message: "Product's Id not provided",
      });
      return;
    }
    let result;
    try {
      result = await User.findOne({ _id: uid }, "-password");
    } catch {async() => {
        if(thumbnail)
        await unlinkFileAsync(thumbnail);
        if(image1)
        await unlinkFileAsync(image1);
        if(image2)
        await unlinkFileAsync(image2);
        if(image3)
        await unlinkFileAsync(image3);
        res.status(422).json({
          status: false,
          message: "Invalid id",
        });
      }}

    if (!result) {
      if(thumbnail)
      await unlinkFileAsync(thumbnail);
      if(image1)
      await unlinkFileAsync(image1);
      if(image2)
      await unlinkFileAsync(image2);
      if(image3)
      await unlinkFileAsync(image3);
      res.status(422).json({
        status: false,
        message: "User not found in our database",
      });
      return;
    }

    if (result.role != "admin") {
      if(thumbnail)
      await unlinkFileAsync(thumbnail);
      if(image1)
      await unlinkFileAsync(image1);
      if(image2)
      await unlinkFileAsync(image2);
      if(image3)
      await unlinkFileAsync(image3);
      res.status(422).json({
        status: false,
        message: "User do not have permission",
      });
      return;
    }

    const product = await Product.findOne({ _id: pid });

    if (title) {
      product.title = title;
    }
    if (price) {
      product.price = price;
    }
    if (desc) {
      product.desc = desc;
    }
    // if (tags) {
    //   product.tags = tags;
    // }
    // if (filters) {
    //   product.filters = {
    //     type: filters.type,
    //     season: filters.season,
    //     for: filters.for,
    //     brand: filters.brand,
    //   };
    // }
    if (thumbnail) {
      product.image = thumbnail;
      product.images.splice(0, 1, thumbnail);
    }
    if (image1) {
      product.images.splice(1, 1, image1);
    }
    if (image2) {
      product.images.splice(2, 1, image2);
    }
    if (image3) {
      product.images.splice(3, 1, image3);
    }
   ;
    product.save()
      .then(() => {
        res.status(201).json({
          status: true,
          message: "Product Updated",
        });
      })
      .catch(async (err) => {
        if(thumbnail)
        await unlinkFileAsync(thumbnail);
        if(image1)
        await unlinkFileAsync(image1);
        if(image2)
        await unlinkFileAsync(image2);
        if(image3)
        await unlinkFileAsync(image3);
        res.status(502).json({
          status: false,
          message: `Error updating Product`,
          error: err,
        });
      });
  }
);

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
      sizes: { $in: filters.size },
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
      price: { $lte: filters.price.lte, $gte: filters.price.gte },
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

router.post("/delete", (req, res) => {
  const id = req.body.id;

  if (!id) {
    res.status(422).json({
      status: false,
      message: "Product's Id not provided",
    });
    return;
  }

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
    const result = await Product.findOne({ _id: id }, "-filters -tags");
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
  const result = await Product.find({}, "-filters -tags", {
    sort: { date: -1 },
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
