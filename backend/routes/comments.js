const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");

// 获取我的评论
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const [comments] = await pool.execute(
      `
      SELECT 
        c.*,
        a.title as article_title
      FROM comments c
      LEFT JOIN articles a ON c.article_id = a.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `,
      [req.user.id]
    );

    res.json({ comments });
  } catch (error) {
    console.error("获取我的评论错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 获取文章评论
router.get("/article/:articleId", async (req, res) => {
  try {
    const [comments] = await pool.execute(
      `
      SELECT 
        c.*,
        u.username as author
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ?
      ORDER BY c.created_at DESC
    `,
      [req.params.articleId]
    );

    res.json({ comments });
  } catch (error) {
    console.error("获取评论错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 添加评论
router.post("/article/:articleId", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO comments (content, user_id, article_id) VALUES (?, ?, ?)",
      [content, req.user.id, req.params.articleId]
    );

    res.status(201).json({
      message: "评论成功",
      commentId: result.insertId,
    });
  } catch (error) {
    console.error("添加评论错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 删除评论
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM comments WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "评论不存在或无权删除" });
    }

    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除评论错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

module.exports = router;
