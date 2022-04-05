const mongoose = require("mongoose");
// const validator = require("validator");

const StudentSchema = new mongoose.Schema({
    firstname: {
        type:String,
        required:true,
        minlength:3
    },
    lastname: {
        type:String,
        required:true,
        minlength:3
    },
    email: {
        type:String,
        required:true,
        unique: [true, "Email is already present"],
        // validate(value) {
        //     if (!validator.isEmail(value)) {
        //         throw new Error("Invalid Email")
        //     }
        // }
    },
    username: {
        type:String,
        required:true,
        minlength:3,
        unique:true
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

// create new collection
const Student = new mongoose.model('Student', StudentSchema);

module.exports = Student;