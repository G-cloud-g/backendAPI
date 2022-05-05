const mongoose = require("mongoose");
const validator = require("validator");

const AdminSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
     CompanyName: {
          type:String,
          required:true,
          minlength:3
      },
      UserName: {
          type:String,
          required:true,
          minlength:3,
          unique:[true,"UserName Already Exists"]
      },
      Email: {
          type:String,
          required:true,
          unique: [true, "Email is already present"],
          validate(value) {
              if (!validator.isEmail(value)) {
                  throw new Error("Invalid Email")
              }
          }
      },
      password: {
          type: String,
          required: true
        },
        UserType:{
            type:String,
            required:true
        },
        OTP: {
            type:String
          },
    });
    const Admin = new mongoose.model('Admin', AdminSchema);
    module.exports =Admin;