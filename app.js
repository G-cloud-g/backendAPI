const express = require("express");
const app = express();
const route = require("./api/routes/routes");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose.connect(
  "mongodb+srv://ruturajj:rutu3095@cluster0.ub8mp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
);

mongoose.connection.on("error", (err) => {
  console.log("connection failed");
});

mongoose.connection.on("connected", (connected) => {
  console.log("database connected");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", route);

app.use((req, res, next) => {
  res.status(404).json({
    error: "bad request",
  });
});

app.use((req, res, next) => {
  res.status(200).json({
    message: "app is running on port 3000",
  });
});

module.exports = app;
