//require the express module
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
// const dateTime = require("simple-datetime-formater");
const bodyParser = require("body-parser");

const userRouter = require("./route/userRoute");
const authRouter = require("./route/authRoute");
const warehouseRouter = require("./route/warehouseRoute");
const productRouter = require("./route/productRoute");
const stockRouter = require("./route/stockRoute");

//require the http module
const http = require("http").Server(app);

// require the socket.io module


const port = 5000;

//bodyparser middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json({
  limit: "8mb",
}));

//Todo routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/warehouses", warehouseRouter);
app.use("/api/products", productRouter);
app.use("/api/stocks", stockRouter);

//set the express.static middleware
app.use(express.static(__dirname + "/public"));




http.listen(port, () => {
  console.log("Running on Port: " + port);
});

// http.listen(80, "192.168.1.1", () => {
//   console.log("Running on Port: " + port);
// });
