const express = require("express");
const router = express.Router();
const Expert = require("./model/ExpertSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const _ = require("lodash");
const Student = require("./model/studentSchema");
const Admin=require('./model/AdminSchema');
const Employee=require('./model/EmployeeSchema');
require("dotenv").config();

const transporter = nodemailer.createTransport(
  sendgridTransport({
    service: "gmail",
    auth: {
    api_key: process.env.API_KEY
    },
  })
);


router.post('/expert/signup',(req,res,next)=>{
  bcrypt.hash(req.body.password,10,(err, hash)=>{
      if(err)
      {
          return res.status(500).json({
              error:err
          })
      }
  else{
  const expert = new Expert({
      _id: new mongoose.Types.ObjectId(),
      Name:req.body.Name,
      UserName:req.body.UserName,
      Email:req.body.Email,
      password:hash,
      phone:req.body.phone,
      Address:req.body.Address,
      Qualification:req.body.Qualification,
      Technology:req.body.Technology
  })
 expert.save()
 .then((user) => {
  transporter.sendMail({
    to: user.Email,
    from:"yunus.mohd@oxcytech.com",
    subject: "SignUp Notification",
    html: "<h1>  You have successfully registered here as a Expert </h1>",
  });
  res.status(200).json({
    message: "Expert Added successfully",
    msg:"Please Check Your Mail"
  });
})
.catch((err) => {
  // console.log(err);
  res.status(500).json
  ({
    Error:"UserName Already exsts",
    Errors:"or Please Enter Unique Email",
    Message:"Expert validation Failed!"
  });
});
}
});
});
//expert login 
router.post('/expert/login', (req, res, next) => {
  Expert.find({ UserName: req.body.UserName })
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
              Name: user[0].Name,
              UserName: user[0].UserName,
              Email: user[0].Email,
              UserType: user[0].UserType,
            },
            "this is dummy text",
            {
              expiresIn: "24h",
            }
          );
          res.status(200).json({
            id:user[0].id,
            Name:user[0].Name,
            UserName: user[0].UserName,
            Email: user[0].Email,
            phone: user[0].phone,
            Address:user[0].Address,
            Qualification:user[0].Qualification,
            Technology:user[0].Technology,
            UserType: user[0].UserType,
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
router.get("/experts", (req, res, next) => {
  Expert.find()
    .then((result) => {
      res.status(200).json({
        experts: result,
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
router.get("/expert", (req, res, next) => {
  Expert.findOne({email:req.body.email})
    .then((result) => {
      res.status(200).json({
        expert: result,
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
     const updateExpert=await Expert.findByIdAndUpdate(_id, req.body,{
         new:true
     })
     res.send(updateExpert);
  }catch(e){
     res.status(400).send(e);
  }
})

//delete expert Records
router.delete("/expert/delete/:id", (req, res, next) => {
  Expert.findByIdAndDelete({ _id: req.params.id })
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

//expert forgot password
router.post('/expert/forgotpwd', (req, res) => {
  
  const OTP=Math.floor(100000 + Math.random() * 900000);
  Expert.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res.status(422).json({
          error: "user doesn't exist",
        });
      }
      user.OTP = OTP;
      user.save().then((result) => {
        transporter.sendMail({
          to: user.Email,
          from: "yunus.mohd@oxcytech.com",
          subject: "Password reset",
          html: `<p>Your request for reset password </p>
          <center><h3>Your OTP is:</h3> <h1>${OTP}</h1></center>`,
        });
        res.json({
          message: "OTP successfully sent on your mail Id. Please check.",
        })
      })
    }).catch((err)=>{
      Message:err
    })
  });


//expert reset passsword
router.patch('/expert/resetpwd', (req, res) => {
  const { OTP, newPass ,email} = req.body;
  bcrypt.hash(newPass,10,(err,hash)=>{
    if(err){
      return res.status(500).json({
        error:err
      });
    }
  else{
      if (OTP) 
    {
      Expert.findOne({ OTP }, (err, user) => 
      {
        if (err || !user) {
          return res.status(422).json({
            error: "OTP is Wrong, Please Enter currect OTP",
          });
        }
        const obj = {
          password: hash,
        };
        user = _.extend(user, obj);
        user.save((err, result) => 
        {
          if (err) {
            return res.status(422).json({ error: "reset password error" });
          } 
          else 
          {
            transporter.sendMail({
            to: user.Email,
            from: "yunus.mohd@oxcytech.com",
            subject: "Account Password Change",
            html: `your password has been changed successfully`,
          });
            res.status(200).json
            ({
              message: "your password has been changed successfully",
            });
          }
        });
      })
    }
  else {
    return res.status(421).json({
      error: "Authentication Error",
    });
  }
}
})
});

//change expert Password
router.post('/expert/changepwd',(req,res)=>
{
  let email=req.body.email;
let newPass=req.body.newPassword;
let oldPass=req.body.current_password;
let confirmPass=req.body.confirm_Password;
if(!newPass || !oldPass){
  return res.status(404).send({message:'Missing body arguments'});
}
Expert.findOne({email},(err, admin)=>
  {
    console.log(admin);
    if (err || !admin) {
      return res.status(422)
      .json({
        error: "user doesn't exist",
      });
    }
    else
    {
      bcrypt.compare(oldPass,admin.password).then((isMatch)=>{
        if(!isMatch){
          return res.status(400)
          .json({
            error:"incorrect current password"
          })
        }
      
        if(newPass==confirmPass){
          bcrypt.hash(newPass,10,(err1,hash)=>
          {
            if(err1) throw err1;
            admin.password=hash;
            admin.save()
            .then((response)=>{
              transporter.sendMail({
              to: admin.Email,
              from: "yunus.mohd@oxcytech.com",
              subject: "Account Password Change",
              html: `your password has been changed successfully`,
            });
              return res.status(200).json({msg:'password change Successfully'});
            })
            .catch((err2)=>{
              res.status(500).json({
                error:[{admin_save_error:err2}],
              });
            });
          });
        }
        else{
          return res.status(400).json({
            message:"confirm_pass doen't match with new_pass"
          })
        }
      })
      .catch((err)=>{
        res.status(501).json({
          err:"error"
        })
      })
    }
  })
})


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
      FirstName:req.body.FirstName,
      LastName:req.body.LastName,
      username:req.body.username,
      email:req.body.email,
      password:hash,
      phone:req.body.phone,
      Address:req.body.Address,
      Qualification:req.body.Qualification,
      Interestarea:req.body.Interestarea,
      Technology:req.body.Technology
  })
 student.save()
 .then((admin) => {
  transporter.sendMail({
    to: admin.email,
    from: "yunus.mohd@oxcytech.com",
    subject: "SignUp Notification",
    html: "<h1>  You have successfully registered here as a student </h1>",
  });
  res.status(200).json({
    message: "Email sent successfully",
  });
})
.catch((err) => {
  res.status(500).json({
    Error:"UserName Already exsts",
    Errors:"or Please Enter Unique Email",
    Message:"Student validation Failed!",
    msg:err,
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
                 Email:user[0].Email,
                 phone:user[0].phone,
                 Interestarea:user[0].Interestarea
             },
             'this is my code',
             {
                 expiresIn:"24h"
             }
             );
             res.status(200).json({
                id:user[0].id,
                FirstName:user[0].FirstName,
                LastName:user[0].LastName,
                 username:user[0].username,
                 email:user[0].email,
                 phone:user[0].phone,
                 Address:user[0].Address,
                 Qualification:user[0].Qualification,
                 Interestarea:user[0].Interestarea,
                 Technology:user[0].Technology,
                 UserType:user[0].UserType,
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
  router.get('/students', (req, res, next) => {
  Student.find()
    .then((result) => {
      res.status(201).json({
        students: result,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
  });

  //get student data 
    router.get('/student', (req, res, next) => {
      Student.findOne({email:req.body.email})
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
        await Student.findAndDelete(req.params.id);
        if(!req.params.id){
            return res.status(400).send();
        }
        res.send(deleteStudents);
    }catch(e){res.status(500).send(e);
  }
})

//student forget-Password
router.post('/student/forgotpwd', (req, res) => {
  
  const OTP=Math.floor(100000 + Math.random() * 900000);//generate 6 digit Random Number
    Student.findOne({ email: req.body.email }).then((student) => {
      if (!student) {
        return res.status(422).json({
          error: "user doesn't exist",
        });
      }
      student.OTP = OTP;
      student.save().then((result) => {
        transporter.sendMail({
          to: student.email,
          from: "yunus.mohd@oxcytech.com",
          subject: "Password reset",
          html: `<p>Your request for reset password </p>
          <center><h3>Your OTP is:</h3> <h1>${OTP}</h1></center>`,
        });
        res.json({
          message: "OTP successfully sent on your mail Id. Please check.",
        })
        })
      }).catch((err)=>{
        Message:err
    });
  });

//student Reset password
router.patch('/student/resetpwd', (req, res) => {
  const { OTP, newPass ,email} = req.body;
  //convert the string password into hash code
  bcrypt.hash(newPass,10,(err,hash)=>{
    if(err){
      return res.status(500).json({
        error:err
      });
    }
  else{
      if (OTP) 
    {
      Student.findOne({ OTP }, (err, student) => 
      {
        if (err || !student) {
          return res.status(422).json({
            error: "OTP is Wrong, Please Enter currect OTP",
          });
        }
        const obj = {
          password: hash,
        };
          student = _.extend(student, obj);
          student.save((err, result) => 
        {
          if (err) {
            return res.status(422).json({ error: "reset password error" });
          } else 
          {
            transporter.sendMail({
            to: student.email,
            from: "yunus.mohd@oxcytech.com",
            subject: "Account Password Change",
            html: `your password has been changed successfully`,
          });
            res.status(200).json
            ({
              message: "your password has been changed successfully",
            });
          }
        });
      })
    }
  else {
    return res.status(421).json({
      error: "Authentication Error",
    });
  }
}
})
});


router.post('/student/changepwd',(req,res)=>
{
  let email=req.body.email;
let newPass=req.body.newPassword;
let oldPass=req.body.current_password;
let confirmPass=req.body.confirm_Password;
if(!newPass || !oldPass){
  return res.status(404).send({message:'Missing body arguments'});
}
//Student findById 
Student.findOne({email},(err, student)=>
  {
    if (err || !student) {
      return res.status(422)
      .json({
        error: "user doesn't exist",
      });
    }
    else
    {
      bcrypt.compare(oldPass,student.password).then((isMatch)=>{
        if(!isMatch){
          return res.status(400)
          .json({
            error:"incorrect current password"
          })
        }
        if(newPass==confirmPass)
        {
          bcrypt.hash(newPass,10,(err1,hash)=>
          {
            if (err1) throw err1;
            student.password=hash;
            student.
            save()
            .then((response)=>{
              transporter.sendMail({
              to: student.email,
              from: "yunus.mohd@oxcytech.com",
              subject: "Account Password Change",
              html: `your password has been changed successfully`,
              });
              return res.status(200).json({
                msg:'password change Successfully'
              });
            })
            .catch((err2)=>{
              res.status(500).json({
                error:[{student_save_error:err2}],
              });
            });
          });
        }
        else
        {
          return res.status(400).json({
            message:"confirm_pass doen't match with new_pass"
          })
        }
      })
      .catch((err)=>{
        res.status(501).json({
          err:"error"
        })
      })
    }
  })
})

router.post('/admin/login',(req,res,next)=>{
 Admin.find({UserName:req.body.UserName})
  .then(admin=>{
      if(admin.length < 1)
      {
          return res.status(401).json({
              msg:'Admin Not Exist'
          })
      }
      bcrypt.compare(req.body.password,admin[0].password,(err,result)=>{
          if(!result)
          {
              return res.status(401).json({
                  msg:'Incorrect Password'
              })
          }
          if(result)
          {
           const token = jwt.sign({
               CompanyName:admin[0].CompanyName,
               UserName:admin[0].UserName,
               Email:admin[0].Email,
               UserType:admin[0].UserType
           },
           'this is my code',
           {
               expiresIn:"24h"
           }
           );
           res.status(200).json({
            CompanyName:admin[0].CompanyName,
            UserName:admin[0].UserName,
            Email:admin[0].Email,
            UserType:admin[0].UserType,
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

//Employee Route
router.post('/employee/signup',(req,res,next)=>{
  bcrypt.hash(req.body.password,10,(err, hash)=>{
      if(err)
      {
          return res.status(500).json({error:err})
      }
      else
      {
      const employee = new Employee({
      FirstName:req.body.FirstName,
      LastName:req.body.LastName,
      UserName:req.body.UserName,
      Email:req.body.Email,
      password:hash,
      UserType:req.body.UserType
  })
 employee.save()
 .then((emp) => {
  res.status(200).json({
    message: "Employee Account Successfully Created",
  });
})
.catch((err) => {
  res.status(500).json({
    _msg:"UserName Already Exist",
    msg:err,
  });
});
}
});
})

router.post('/employee/login',(req,res,next)=>{
  Employee.find({UserName:req.body.UserName})
   .then(admin=>{
       if(admin.length < 1)
       {
           return res.status(401).json({
               msg:'Employee Not Exist'
           })
       }
       bcrypt.compare(req.body.password,admin[0].password,(err,result)=>{
           if(!result)
           {
               return res.status(401).json({
                   msg:'Incorrect Password'
               })
           }
           if(result)
           {
            const token = jwt.sign({
                FirstName:admin[0].FirstName,
                LastName:admin[0].LastName,
                UserName:admin[0].UserName,
                Email:admin[0].Email,
                UserType:admin[0].UserType
            },
            'this is my code',
            {
                expiresIn:"24h"
            }
            );
            res.status(200).json({
              FirstName:admin[0].FirstName,
              LastName:admin[0].LastName,
             UserName:admin[0].UserName,
             Email:admin[0].Email,
             UserType:admin[0].UserType,
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
 router.post('/employee/forgotpwd', (req, res) => {
  
  const OTP=Math.floor(100000 + Math.random() * 900000);
    Employee.findOne({ Email: req.body.email }).then((employee) => {
      if (!employee) {
        return res.status(422).json({
          error: "user doesn't exist",
        });
      }
      employee.OTP = OTP;
      employee.save().then((result) => {
        transporter.sendMail({
          to: employee.Email,
          from: "yunus.mohd@oxcytech.com",
          subject: "Password reset",
          html: `<p>Your request for reset password </p>
          <center><h3>Your OTP is:</h3> <h1>${OTP}</h1></center>`,
        });
        res.json({
          message: "OTP successfully sent on your mail Id. Please check.",
        })
        })
      }).catch((err)=>{
        Message:err
    });
  });


router.patch('/employee/resetpwd', (req, res) => {
  const { OTP, newPass ,email} = req.body;
  bcrypt.hash(newPass,10,(err,hash)=>{
    if(err){
      return res.status(500).json({
        error:err
      });
    }
  else{
      if (OTP) 
    {
      Employee.findOne({ OTP }, (err, employee) => 
      {
        if (err || !employee) {
          return res.status(422).json({
            error: "OTP is Wrong, Please Enter currect OTP",
          });
        }
        const obj = {
          password: hash,
        };
          employee = _.extend(employee, obj);
          employee.save((err, result) => 
        {
          if (err) {
            return res.status(422).json({ error: "reset password error" });
          } else 
          {
            transporter.sendMail({
            to: employee.Email,
            from: "yunus.mohd@oxcytech.com",
            subject: "Account Password Change",
            html: `your password has been changed successfully`,
          });
            res.status(200).json
            ({
              message: "your password has been changed successfully",
            });
          }
        });
      })
    }
  else {
    return res.status(421).json({
      error: "Authentication Error",
    });
  }
}
})
});

router.post('/employee/changepwd',(req,res)=>
{
let Email=req.body.email;
let newPass=req.body.newPassword;
let oldPass=req.body.current_password;
let confirmPass=req.body.confirm_Password;
if(!newPass || !oldPass){
  return res.status(404).send({message:'Missing body arguments'});
}

Employee.findOne({Email},(err, employee)=>
  {
    if (err || !employee) {
      return res.status(422)
      .json({
        error: "user doesn't exist",
      });
    }
    else
    {
      bcrypt.compare(oldPass,employee.password).then((isMatch)=>{
        if(!isMatch){
          return res.status(400)
          .json({
            error:"incorrect current password"
          })
        }
        if(newPass==confirmPass)
        {
          bcrypt.hash(newPass,10,(err1,hash)=>
          {
            if (err1) throw err1;
            employee.password=hash;
            employee.
            save()
            .then((response)=>{
              transporter.sendMail({
              to: employee.Email,
              from: "yunus.mohd@oxcytech.com",
              subject: "Account Password Change",
              html: `your password has been changed successfully`,
              });
              return res.status(200).json({
                msg:'password change Successfully'
              });
            })
            .catch((err2)=>{
              res.status(500).json({
                error:[{student_save_error:err2}],
              });
            });
          });
        }
        else
        {
          return res.status(400).json({
            message:"confirm_pass doen't match with new_pass"
          })
        }
      })
      .catch((err)=>{
        res.status(501).json({
          err:"error"
        })
      })
    }
  })
})

    module.exports = router;