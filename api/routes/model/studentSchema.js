const mongoose = require("mongoose");
const validator = require("validator");

const studentSchema = new mongoose.Schema({
    FirstName: {
        type:String,
        required:true,
     
    },
    LastName:{
      type:String,
      required:true,

    },
    username: {
        type:String,
        required:true,
        unique:true
    },
    email: {
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
        unique:true
    },
    Address : {
        type:String,
        required:true
    },
    Qualification: {
        type:String,
        required: true
    },
    Interestarea: {
        type:String,
        required: true
    },
    Technology: {
        type:String,
        required: true
    },
    UserType: {
        type:Number,
        default: 0
    },
    OTP:{
        type:String
    },
    // expireOTP:{
    //     type:Date
    // }

})

const Student = new mongoose.model('Student', studentSchema);

module.exports = Student;