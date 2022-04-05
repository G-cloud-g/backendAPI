const express = require("express");
const router = express.Router();
const Admin = require("./model/adminSchema");
const Student = require("./model/studentSchema");
const mongoose = require("mongoose");
const bcrypt=require('bcrypt');
// const jwt=require('jsonwebtoken');

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
   .then((result)=>{
       console.log(result);
       res.status(200).json({
           newStudent: result
       });
   })
   .catch((err)=>{
       console.log(err);
      //  res.status(500).json({
      //      error:err
      //  });
      res.send(`Value entered for ${Object.keys(err.keyPattern)}  is already present`);
      // res.send(`This Username ${err.keyValue.username}  is already present`);
      // res.send(`This Phone number ${err.keyValue.phone}  is already present`);
      // res.send(`The given value is already present ${err.keyValue}` );
      // res.send(err);
    })
    }

});
})

// router.post("/students", (req, res) => {
//   bcrypt.hash(req.body.password,10,(err, hash)=>{
//     if(err)
//     {
//         return res.status(500).json({
//             error:err
//         })
//     }
// else{

//   const user = new Student(req.body);
//   user.save().then(() => {
//       res.send(user + "Student record saved successfully");
      


//   }).catch((e) => {
     
//       res.send("Error is "+ e)
//   })
// }

// })
// })

module.exports = router;


// const express = require('express');
// const router=express.Router();
// const Student=require('./models/studentSchema');
// const mongoose=require('mongoose');
// const bcrypt=require('bcrypt');
// const jwt=require('jsonwebtoken');

// router.get('/',(req,res,next)=>{
//     res.status(200).json({
//         message:"This is get req"
//     });
// });


// router.post('/student/signup',(req,res,next)=>{
//     bcrypt.hash(req.body.password,10,(err, hash)=>{
//         if(err)
//         {
//             return res.status(500).json({
//                 error:err
//             })
//         }
//     else{
//     const student = new Student({
//         _id: new mongoose.Types.ObjectId(),
//         firstname:req.body.firstname,
//         username:req.body.username,
//         email:req.body.email,
//         password:hash,
//         phone:req.body.phone,
//         address:req.body.address,
//         qualification:req.body.qualification,
//         interestarea:req.body.interestarea,
//         technology:req.body.technology
 
//     })
//    student.save()
//    .then((result)=>{
//        console.log(result);
//        res.status(200).json({
//            newStudent: result
//        });
//    })
//    .catch((err)=>{
//        console.log(err);
//        res.status(500).json({
//            error:err
//        });
//     })
//     }

// });