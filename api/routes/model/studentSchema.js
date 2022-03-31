const mongoose = require("mongoose");
const validator = require("validator");

const studentSchema = new mongoose.Schema({
    firstname: {
        type:String,
        required:true,
        minlength:3
    },
    username: {
        type:String,
        required:true,
        minlength:3
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
    address : {
        type:String,
        required:true
    },
    qualification: {
        type:String,
        required: true
    },
    interestarea: {
        type:String,
        required: true
    },
    technology: {
        type:String,
        required: true
    },
    usertype: {
        type:Number,
        default: 0
    }
})

const Student = new mongoose.model('Student', studentSchema);

module.exports = Student;