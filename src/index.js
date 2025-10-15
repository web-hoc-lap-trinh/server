const express = require("express");
require("dotenv").config();

const authRoutes = require("./api/auth/auth.route"); 
const userRoutes = require("./api/user/user.route");
const docsRoutes = require("./routes/docs"); 

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use("/", docsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📚 Tài liệu API có tại: http://localhost:${PORT}/`);
});
