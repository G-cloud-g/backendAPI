const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  username: String,
  email: {
    type: String,
    required: true,
  },
  password: String,
  userType: String,

  resetToken: String,
  expireToken: Date,
});

module.exports = mongoose.model("Admin", AdminSchema);
