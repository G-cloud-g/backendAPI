const http = require("http");
const app = require("./app");
// require("dotenv").config();
const server = http.createServer(app);


server.listen(3001, console.log("app is running"));
