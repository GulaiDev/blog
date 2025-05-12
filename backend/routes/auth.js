const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { generateToken } = require("../config/jwt");

// 注册
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 检查用户名是否已存在
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "用户名已存在" });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const [result] = await pool.execute(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    res.status(201).json({ message: "注册成功" });
  } catch (error) {
    console.error("注册错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 登录
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    // 生成 token
    const token = generateToken({ id: user.id, username: user.username });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("登录错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

module.exports = router;
