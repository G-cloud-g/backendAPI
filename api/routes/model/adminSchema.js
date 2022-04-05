const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  username: String,
  email: String,
  password: String,
  userType: Boolean,
});

module.exports = mongoose.model("Admin", AdminSchema);
