const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");

// 获取文章列表
router.get("/", async (req, res) => {
  try {
    const [articles] = await pool.execute(
      `
      SELECT 
        a.*,
        u.username as author,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT f.id) as favorites_count,
        COALESCE(AVG(r.rating), 0) as rating,
        EXISTS(SELECT 1 FROM favorites WHERE article_id = a.id AND user_id = ?) as is_favorite
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN comments c ON a.id = c.article_id
      LEFT JOIN favorites f ON a.id = f.article_id
      LEFT JOIN ratings r ON a.id = r.article_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `,
      [req.user?.id || 0]
    );

    res.json({ articles });
  } catch (error) {
    console.error("获取文章列表错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 获取我的文章
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const [articles] = await pool.execute(
      `
      SELECT 
        a.*,
        u.username as author,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT f.id) as favorites_count,
        COALESCE(AVG(r.rating), 0) as rating,
        EXISTS(SELECT 1 FROM favorites WHERE article_id = a.id AND user_id = ?) as is_favorite
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN comments c ON a.id = c.article_id
      LEFT JOIN favorites f ON a.id = f.article_id
      LEFT JOIN ratings r ON a.id = r.article_id
      WHERE a.user_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `,
      [req.user.id, req.user.id]
    );

    res.json({ articles });
  } catch (error) {
    console.error("获取我的文章错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 获取我的收藏
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    const [articles] = await pool.execute(
      `
      SELECT 
        a.*,
        u.username as author,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT f.id) as favorites_count,
        COALESCE(AVG(r.rating), 0) as rating,
        TRUE as is_favorite,
        fav.created_at as favorite_date
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN comments c ON a.id = c.article_id
      LEFT JOIN favorites f ON a.id = f.article_id
      LEFT JOIN ratings r ON a.id = r.article_id
      INNER JOIN favorites fav ON a.id = fav.article_id AND fav.user_id = ?
      GROUP BY a.id, fav.created_at
      ORDER BY fav.created_at DESC
    `,
      [req.user.id]
    );

    res.json({ articles });
  } catch (error) {
    console.error("获取收藏文章错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 获取文章详情
router.get("/:id", async (req, res) => {
  try {
    const [articles] = await pool.execute(
      `
      SELECT 
        a.*,
        u.username as author,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT f.id) as favorites_count,
        COALESCE(AVG(r.rating), 0) as rating,
        EXISTS(SELECT 1 FROM favorites WHERE article_id = a.id AND user_id = ?) as is_favorite
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN comments c ON a.id = c.article_id
      LEFT JOIN favorites f ON a.id = f.article_id
      LEFT JOIN ratings r ON a.id = r.article_id
      WHERE a.id = ?
      GROUP BY a.id
    `,
      [req.user?.id || 0, req.params.id]
    );

    if (articles.length === 0) {
      return res.status(404).json({ message: "文章不存在" });
    }

    // 更新浏览量
    await pool.execute("UPDATE articles SET views = views + 1 WHERE id = ?", [
      req.params.id,
    ]);

    res.json({ article: articles[0] });
  } catch (error) {
    console.error("获取文章详情错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 创建文章
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO articles (title, content, user_id) VALUES (?, ?, ?)",
      [title, content, req.user.id]
    );

    res.status(201).json({
      message: "创建成功",
      articleId: result.insertId,
    });
  } catch (error) {
    console.error("创建文章错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 更新文章
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const [result] = await pool.execute(
      "UPDATE articles SET title = ?, content = ? WHERE id = ? AND user_id = ?",
      [title, content, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "文章不存在或无权修改" });
    }

    res.json({ message: "更新成功" });
  } catch (error) {
    console.error("更新文章错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 删除文章
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM articles WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "文章不存在或无权删除" });
    }

    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除文章错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 收藏/取消收藏文章
router.post("/:id/favorite", authMiddleware, async (req, res) => {
  try {
    // 检查是否已经收藏
    const [existing] = await pool.execute(
      "SELECT id FROM favorites WHERE user_id = ? AND article_id = ?",
      [req.user.id, req.params.id]
    );

    if (existing.length > 0) {
      return res.json({ message: "已经收藏过了" });
    }

    await pool.execute(
      "INSERT INTO favorites (user_id, article_id) VALUES (?, ?)",
      [req.user.id, req.params.id]
    );
    res.json({ message: "收藏成功" });
  } catch (error) {
    console.error("收藏文章错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

router.delete("/:id/favorite", authMiddleware, async (req, res) => {
  try {
    // 检查是否已经收藏
    const [existing] = await pool.execute(
      "SELECT id FROM favorites WHERE user_id = ? AND article_id = ?",
      [req.user.id, req.params.id]
    );

    if (existing.length === 0) {
      return res.json({ message: "还没有收藏过" });
    }

    await pool.execute(
      "DELETE FROM favorites WHERE user_id = ? AND article_id = ?",
      [req.user.id, req.params.id]
    );
    res.json({ message: "取消收藏成功" });
  } catch (error) {
    console.error("取消收藏文章错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 评分
router.post("/:id/rate", authMiddleware, async (req, res) => {
  try {
    const { rating } = req.body;
    await pool.execute(
      "INSERT INTO ratings (user_id, article_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?",
      [req.user.id, req.params.id, rating, rating]
    );
    res.json({ message: "评分成功" });
  } catch (error) {
    console.error("评分错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
});

module.exports = router;
