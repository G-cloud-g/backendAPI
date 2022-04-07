const mongoose = require("mongoose");
const validator = require("validator");

const AdminSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type:String,
    required:true
  },
  username:{
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
  password:{
    type: String,
  },
  userType:{
    type:String,
  } ,

  resetToken: {
    type:String
  },
  expireToken:{
    type:Date,
  } 
});

module.exports = mongoose.model("Admin", AdminSchema);
