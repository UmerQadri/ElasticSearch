const express = require("express");
const app = express();
const products = require("./routes/products");
const bodyParser = require("body-parser");

let port = process.env.port || 3000;

app.use("/api/v1", products);

app.listen(port);
console.log("Web server is listening at port " + (process.env.port || 3000));
