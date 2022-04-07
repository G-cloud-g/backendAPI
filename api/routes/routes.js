const express = require("express");
const router = express.Router();
const Admin = require("./model/adminSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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

//expert signup
router.post("/expert/signup", (req, res, next) => {
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
            from: "shaikhaasim369@gmail.com",
            subject: "SignUp Notification",
            html: "<h1> You have successfully registered </h1>",
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

//expert login 
router.post('/expert/login', (req, res, next) => {
  Admin.find({ username: req.body.username })
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

//get expert data
router.get("/expert", (req, res, next) => {
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

//get expert data by ID
router.get("/expert/:id", (req, res, next) => {
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

//Update Expert Details
router.patch('/expert/update/:id', async (req,res)=>{
  try{
      const _id = req.params.id;
     const updateExpert=await Admin.findByIdAndUpdate(_id, req.body,{
         new:true
     })
     res.send(updateExpert);
  }catch(e){
     res.status(400).send(e);
  }
})

//delete expert Records
router.delete("/expert/delete/:id", (req, res, next) => {
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

//expert forget password
router.post('/expert/forgetpassword', (req, res) => {
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
          from: "shaikhaasim369@gmail.com",
          subject: "Password reset",
          html: `<p>Your request for reset password </p>
            <h5>click on this  <a href="http://localhost:3000/reset/${token}">link</a> to reset password</h5>`,
        });
        res.json({
          message: "Reset email sent successfully. Please check your email.",
        });
      });
    });
  });
})

//expert reset passsword
router.patch("/expert/resetpassword", (req, res) => {
  const { resetToken, newPass } = req.body;
  if (resetToken) 
  {
    jwt.verify(resetToken,(error,decoded)=>{
      console.log(resetToken);
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
              message: "your password has been changed successfully",
            });
          }
        });
      });
    });
  } 
  else {
    return res.status(422).json({
      error: "Authentication Error",
    });
  }
});

//student signup
router.post('/student/signup',(req,res,next)=>{
  bcrypt.hash(req.body.password,10,(err, hash)=>{
      if(err)
      {
          return res.status(500).json({
              error:err
          })
      }
  else{
  const student = new Student({
      _id: new mongoose.Types.ObjectId(),
      firstname:req.body.firstname,
      lastname:req.body.lastname,
      username:req.body.username,
      email:req.body.email,
      password:hash,
      phone:req.body.phone,
      address:req.body.address,
      qualification:req.body.qualification,
      interestarea:req.body.interestarea,
      technology:req.body.technology
  })
 student.save()
 .then((admin) => {
  transporter.sendMail({
    to: admin.email,
    from: "shaikhaasim369@gmail.com",
    subject: "SignUp Notification",
    html: "<h1>  You have successfully registered here as a student </h1>",
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

//student login
router.post('/student/login',(req,res,next)=>{
    Student.find({username:req.body.username})
    .then(user=>{
        console.log(user);
        if(user.length < 1)
        {
            return res.status(401).json({
                msg:'User Not Exist'
            })
        }
        bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
            if(!result)
            {
                return res.status(401).json({
                    msg:'Incorrect Password'
                })
            }
            if(result)
            {
             const token = jwt.sign({
                 username:user[0].username,
                 email:user[0].email,
                 phone:user[0].phone,
                 interestarea:user[0].interestarea
             },
             'this is my code',
             {
                 expiresIn:"24h"
             }
             );
             res.status(200).json({
                 username:user[0].username,
                 email:user[0].email,
                 phone:user[0].phone,
                 interestarea:user[0].interestarea,
                 token:token
             })
            }
        })
    })
    .catch(err=>{
        res.status(500).json
        ({
            err:error
        })
    })
  })

//get students data
  router.get('/student', (req, res, next) => {
  Student.find()
    .then((result) => {
      res.status(201).json({
        student: result,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
  });

  //get student data by ID
    router.get('/student/:id', (req, res, next) => {
      Student.findById(req.params.id)
        .then((result) => {
          res.status(200).json({
            student: result,
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({
            error: error,
          });
        });
      }); 
    
//Update student details
router.patch('/student/update/:id', async (req,res)=>{
    try{
        const _id = req.params.id;
       const updateStudent=await Student.findByIdAndUpdate(_id, req.body,{
           new:true
       })
       res.send(updateStudent);
    }catch(e){
       res.status(400).send(e);
    }
})

//delete student records
router.delete('/student/delete/:id',async(req,res)=>{
    try{
        const deleteStudents=
        await Student.findByIdAndDelete(req.params.id);
        if(!req.params.id){
            return res.status(400).send();
        }
        res.send(deleteStudents);
    }catch(e){res.status(500).send(e);
  }
})

//student forget-Password
router.post('/student/forgetpassword', (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    Student.findOne({ email: req.body.email }).then((student) => {
      if (!student) {
        return res.status(420).json({
          error: "student doesn't exist",
        });
      }
      student.resetToken = token;
      student.expireToken = Date.now() + 3600000;
      student.save().then((result) => {
        transporter.sendMail({
          to: student.email,
          from: "shaikhaasim369@gmail.com",
          subject: "Password reset",
          html: `<p>Your request for reset password </p>
            <h5>click on this  <a href="http://localhost:3000/reset/${token}">link</a> to reset password</h5>`,
        });
        res.json({
          message: "Reset email sent successfully. Please check your email.",
        });
      });
    });
 
  });
})

//student Reset password
router.patch('/student/resetpassword', (req, res) => {
  const { resetToken, newPass } = req.body;
  if (resetToken) 
  {
    jwt.verify(resetToken,(error,decoded)=>{
      if (error) {
        return res.status(422).json({
          error: "Incorrect Token",
        });
      }
      Student.findOne({ resetToken }, (err, student) => {
        if (err || !student) {
          return res.status(422).json({
            error: "user with same token doesn't exist",
          });
        }
        const obj = {
          password: newPass,
        };

        student = _.extend(student, obj);
        student.save((err, result) => {
          if (err) {
            return res.status(422).json({ error: "reset password error" });
          } else {
            res.status(200).json({
              message: "your password has been changed successfully",
            });
          }
        });
      });
    });
  } 
  else {
    return res.status(421).json({
      error: "Authentication Error",
    });
  }
});

    module.exports = router;

