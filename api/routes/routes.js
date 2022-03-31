const express = require('express');
const router=express.Router();
const Student=require('./model/studentSchema');
const Admin=require('./model/adminSchema')
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

router.get('/',(req,res,next)=>{
    res.status(200).json({
        message:"This is get req"
    });
});

router.post("/signup", (req, res, next) => {
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
          newExpert: result,
        });
      })
  
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  });

router.post('/student/login',(req,res,next)=>{
    Student.find({username:req.body.username})
    .exec()
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
    }).catch(err=>{
        res.status(500).json({
            err:error
        })
    })
    
router.patch("/student/update/:id", async (req,res)=>{
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

router.delete("/student/delete/:id",async(req,res)=>{
    try{
        const deleteStudents=
        await Student.findByIdAndDelete(req.params.id);
        if(!req.params.id){
            return res.status(400).send();
        }
        res.send(deleteStudents);
    }catch(e){res.status(500).send(e);}
   
})
})
module.exports = router;
