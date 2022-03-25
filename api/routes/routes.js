const express = require("express");
const router = express.Router();
const Admin = require("./model/adminSchema");
const mongoose = require("mongoose");

router.get("/", (req, res, next) => {
  res.status(200).json({
    msg: "this is get req",
  });
});

router.post("/", (req, res, next) => {
  const admin = new Admin({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    userType: req.body.userType,
  });

  admin
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        newStudent: result,
      });
    })

    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
