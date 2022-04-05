const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://ruturajj:rutu3095@cluster0.ub8mp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority").then(() => {
    console.log("Connection is successfull");
}).catch((e) => {
    console.log("No connection"+ e);
})