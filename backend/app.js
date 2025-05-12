const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const commentRoutes = require("./routes/comments");

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/comments", commentRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "服务器错误" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
