const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./auth/auth");
const docsRoutes = require("./docs");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.use("/", docsRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy ở http://localhost:${PORT}`);
});
