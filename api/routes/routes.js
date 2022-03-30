const express = require('express');
const router=express.Router();
const Student=require('./model/studentSchema');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

router.get('/',(req,res,next)=>{
    res.status(200).json({
        message:"This is get req"
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
    })

module.exports=router;