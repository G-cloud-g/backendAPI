const express = require("express");
const router = express.Router();
const Admin = require("./model/adminSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const _ = require("lodash");
const Student = require("./model/studentSchema");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    service: "gmail",
    auth: {
      api_key:
        "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",
    },
  })
);

//get data

router.get("/", (req, res, next) => {
  Admin.find()
    .then((result) => {
      res.status(200).json({
        admin: result,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

//get data by ID

router.get("/:id", (req, res, next) => {
  Admin.findById(req.params.id)
    .then((result) => {
      res.status(200).json({
        admin: result,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

//delete data

router.delete("/:id", (req, res, next) => {
  Admin.findByIdAndDelete({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({
        message: "Item Deleted",
        result: result,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

//signup

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    } else {
      const admin = new Admin({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: hash,
        userType: req.body.userType,
      });

      admin
        .save()
        .then((admin) => {
          transporter.sendMail({
            to: admin.email,
            from: "ruturajwaychal@gmail.com",
            subject: "O Captain My Captain",
            html: "<h1> welcome to Dead Poets Society </h1>",
          });
          res.status(200).json({
            message: "Email sent successfully",
          });
        })

        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    }
  });
});

//login data

router.post("/login", (req, res, next) => {
  Admin.find({ username: req.body.username })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "user does not exist",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (!result) {
          return res.status(401).json({
            message: "Password matching failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              name: user[0].name,
              email: user[0].email,
              username: user[0].username,
              userType: user[0].userType,
            },
            "this is dummy text",
            {
              expiresIn: "24h",
            }
          );

          res.status(200).json({
            username: user[0].username,
            userType: user[0].userType,
            email: user[0].email,
            phone: user[0].phone,
            token: token,
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        err: err,
      });
    });
});

//forget password

router.post("/forgetpassword", (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    Admin.findOne({ email: req.body.email }).then((admin) => {
      if (!admin) {
        return res.status(422).json({
          error: "user doesn't exist",
        });
      }
      admin.resetToken = token;
      admin.expireToken = Date.now() + 3600000;
      admin.save().then((result) => {
        transporter.sendMail({
          to: admin.email,
          from: "ruturajwaychal@gmail.com",
          subject: "Password reset",
          html: `<p>Your request for reset password </p>
            <h5>click on this link <a href="http://localhost:3000/reset/">${token}</a> to reset password</h5>`,
        });
        res.json({
          message: "Reset email sent successfully. Please check your email.",
        });
      });
    });
  });

  //reset passsword

  router.put("/resetpassword", (req, res) => {
    const { resetToken, newPass } = req.body;
    if (resetToken) {
      jwt.verify(resetToken, function (error, decodedData) {
        if (error) {
          return res.status(422).json({
            error: "Incorrect Token",
          });
        }

        Admin.findOne({ resetToken }, (err, admin) => {
          if (err || !admin) {
            return res.status(422).json({
              error: "user with same token doesn't exist",
            });
          }

          const obj = {
            password: newPass,
          };

          admin = _.extend(admin, obj);

          admin.save((err, result) => {
            if (err) {
              return res.status(422).json({ error: "reset password error" });
            } else {
              res.status(200).json({
                // verfiyToken: token,
                message: "your password has been changed successfully",
              });
            }
          });
        });
      });
    } else {
      return res.status(422).json({
        error: "Authentication Error",
      });
    }
  });

  //student login

  router.post("/student/login", (req, res, next) => {
    Student.find({ username: req.body.username })
      .exec()
      .then((user) => {
        console.log(user);
        if (user.length < 1) {
          return res.status(401).json({
            msg: "User Not Exist",
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (!result) {
            return res.status(401).json({
              msg: "Incorrect Password",
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                username: user[0].username,
                email: user[0].email,
                phone: user[0].phone,
                interestarea: user[0].interestarea,
              },
              "this is my code",
              {
                expiresIn: "24h",
              }
            );
            res.status(200).json({
              username: user[0].username,
              email: user[0].email,
              phone: user[0].phone,
              interestarea: user[0].interestarea,
              token: token,
            });
          }
        });
      })
      .catch((err) => {
        res.status(500).json({
          err: error,
        });
      });

    // const { email } = req.body.email;
    // Admin.findOne({ email }, (err, user) => {
    //   if (err || !user) {
    //     return res
    //       .status(400)
    //       .json({
    //         error: "user with this email does not exist",
    //       })

    //       .then((admin) => {
    //         transporter.sendMail({
    //           to: admin.email,
    //           from: "ruturajwaychal@gmail.com",
    //           subject: "Account Activation Link",
    //           html: "<h1>Please Clicl on the link given below </h1>",
    //         });
    //       });
    //   }
    //   res.status(200).json({
    //     newStudent: email,
    //   });
    // });
  });
});

module.exports = router;
