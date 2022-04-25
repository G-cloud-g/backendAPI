const mongoose = require("mongoose");
const validator = require("validator");

const EmployeeSchema = new mongoose.Schema({
  
     FirstName: {
          type:String,
          required:true,
          minlength:3
      },
       LastName: {
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
        UserType: {
            type:Number,
            default: 2
        },
        OTP: {
            type:String
          },
    });
    const Employee = new mongoose.model('Employee', EmployeeSchema);
    module.exports =Employee;