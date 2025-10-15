const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./auth/auth.route"); 
const docsRoutes = require("./controllers/docs");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.use("/auth", authRoutes); 

module.exports = app; 