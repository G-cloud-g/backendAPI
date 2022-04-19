const mongoose = require("mongoose");
const validator = require("validator");

const ExpertSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
   Name: {
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
    phone: {
        type:Number,
        min:10,
        required:true,
    },
    Address : {
        type:String,
        required:true
    },
    Qualification: {
        type:String,
        required: true
    },
    Technology: {
        type:String,
        required: true
    },
  UserType: {
    type:Number,
    default: 1
},

  OTP: {
    type:String
  },
//   expireOTP:{
//     type:Date,
//   } 
});
const Expert = new mongoose.model('Expert', ExpertSchema);
module.exports =Expert;
