<template>
  <div class="article-detail">
    <div v-if="loading" class="text-center">加载中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <template v-else>
      <article class="card">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="author">作者：{{ article.author }}</span>
          <span class="date"
            >发布时间：{{ formatDate(article.created_at) }}</span
          >
          <span class="views">浏览：{{ article.views }}</span>
        </div>
        <div class="article-content">{{ article.content }}</div>
        <div class="article-actions">
          <div class="article-stats">
            <span class="comments">评论：{{ article.comments_count }}</span>
            <span class="favorites">收藏：{{ article.favorites_count }}</span>
            <span class="rating"
              >评分：{{ Number(article.rating).toFixed(1) }}</span
            >
          </div>
          <div class="action-buttons">
            <button
              v-if="userStore.isLoggedIn"
              @click="toggleFavorite"
              class="btn btn--secondary"
            >
              {{ article.is_favorite ? "取消收藏" : "收藏" }}
            </button>
            <button
              v-if="userStore.isLoggedIn"
              @click="showRatingModal = true"
              class="btn btn--secondary"
            >
              评分
            </button>
            <router-link
              v-if="isAuthor"
              :to="`/article/edit/${article.id}`"
              class="btn btn--secondary"
            >
              编辑
            </router-link>
            <button
              v-if="isAuthor"
              @click="handleDelete"
              class="btn btn--secondary"
            >
              删除
            </button>
          </div>
        </div>
      </article>

      <!-- 评分模态框 -->
      <div v-if="showRatingModal" class="modal">
        <div class="modal-content">
          <h3>评分</h3>
          <div class="rating-stars">
            <span
              v-for="star in 5"
              :key="star"
              @click="rateArticle(star)"
              :class="{ active: star <= currentRating }"
            >
              ★
            </span>
          </div>
          <div class="modal-actions">
            <button @click="showRatingModal = false" class="btn btn--secondary">
              取消
            </button>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments-section card">
        <h2>评论</h2>
        <div v-if="userStore.isLoggedIn" class="comment-form">
          <textarea
            v-model="newComment"
            placeholder="写下你的评论..."
            rows="3"
          ></textarea>
          <button @click="submitComment" class="btn">发表评论</button>
        </div>
        <div v-else class="login-prompt">
          请<router-link to="/login">登录</router-link>后发表评论
        </div>
        <div class="comments-list">
          <div v-if="commentsLoading" class="text-center">加载中...</div>
          <div v-else-if="commentsError" class="error-message">
            {{ commentsError }}
          </div>
          <template v-else>
            <div v-for="comment in comments" :key="comment.id" class="comment">
              <Comment :comment="comment" />
              <button
                v-if="isCommentAuthor(comment)"
                @click="deleteComment(comment.id)"
                class="btn btn--secondary btn-sm"
              >
                删除
              </button>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { get, post, del } from "@/utils/request";
import { formatDate } from "@/utils/formatDate";
import Comment from "@/components/Comment.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const article = ref(null);
const loading = ref(true);
const error = ref("");
const comments = ref([]);
const commentsLoading = ref(true);
const commentsError = ref("");
const newComment = ref("");
const showRatingModal = ref(false);
const currentRating = ref(0);

const isAuthor = computed(() => {
  return (
    userStore.isLoggedIn && article.value?.user_id === userStore.getUserInfo.id
  );
});

const fetchArticle = async () => {
  try {
    loading.value = true;
    error.value = "";
    const response = await get(`/articles/${route.params.id}`);
    article.value = response.article;
  } catch (err) {
    error.value = "获取文章详情失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchComments = async () => {
  try {
    commentsLoading.value = true;
    commentsError.value = "";
    const response = await get(`/comments/article/${route.params.id}`);
    comments.value = response.comments;
  } catch (err) {
    commentsError.value = "获取评论失败";
    console.error(err);
  } finally {
    commentsLoading.value = false;
  }
};

const toggleFavorite = async () => {
  try {
    if (article.value.is_favorite) {
      await del(`/articles/${article.value.id}/favorite`);
      article.value.is_favorite = false;
      article.value.favorites_count--;
    } else {
      await post(`/articles/${article.value.id}/favorite`);
      article.value.is_favorite = true;
      article.value.favorites_count++;
    }
  } catch (err) {
    console.error("收藏操作失败:", err);
  }
};

const rateArticle = async (rating) => {
  try {
    await post(`/articles/${article.value.id}/rate`, { rating });
    article.value.rating = rating;
    showRatingModal.value = false;
  } catch (err) {
    console.error("评分失败:", err);
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;

  try {
    await post(`/comments/article/${article.value.id}`, {
      content: newComment.value,
    });
    newComment.value = "";
    fetchComments();
  } catch (err) {
    console.error("发表评论失败:", err);
  }
};

const deleteComment = async (commentId) => {
  try {
    await del(`/comments/${commentId}`);
    comments.value = comments.value.filter((c) => c.id !== commentId);
  } catch (err) {
    console.error("删除评论失败:", err);
  }
};

const handleDelete = async () => {
  if (!confirm("确定要删除这篇文章吗？")) return;

  try {
    await del(`/articles/${article.value.id}`);
    router.push("/");
  } catch (err) {
    console.error("删除文章失败:", err);
  }
};

const isCommentAuthor = (comment) => {
  return userStore.isLoggedIn && comment.user_id === userStore.getUserInfo.id;
};

onMounted(() => {
  fetchArticle();
  fetchComments();
});
</script>

<style lang="scss" scoped>
.article-detail {
  .article-title {
    font-size: $font-size-xl;
    margin-bottom: $spacing-md;
  }

  .article-meta {
    color: $text-light;
    font-size: $font-size-sm;
    margin-bottom: $spacing-md;

    span {
      margin-right: $spacing-md;
    }
  }

  .article-content {
    line-height: 1.8;
    margin-bottom: $spacing-lg;
    white-space: pre-wrap;
  }

  .article-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    .article-stats {
      color: $text-light;
      font-size: $font-size-sm;

      span {
        margin-right: $spacing-md;
      }
    }

    .action-buttons {
      display: flex;
      gap: $spacing-sm;
    }
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  .modal-content {
    background-color: $white;
    padding: $spacing-lg;
    border-radius: $border-radius;
    width: 100%;
    max-width: 400px;

    h3 {
      margin-bottom: $spacing-md;
    }

    .rating-stars {
      display: flex;
      justify-content: center;
      gap: $spacing-sm;
      margin-bottom: $spacing-md;
      font-size: 24px;

      span {
        cursor: pointer;
        color: $border-color;

        &.active {
          color: #ffd700;
        }
      }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
    }
  }
}

.comments-section {
  margin-top: $spacing-lg;

  h2 {
    margin-bottom: $spacing-md;
  }

  .comment-form {
    margin-bottom: $spacing-lg;

    textarea {
      width: 100%;
      margin-bottom: $spacing-sm;
      resize: vertical;
    }
  }

  .login-prompt {
    text-align: center;
    margin-bottom: $spacing-lg;
    color: $text-light;

    a {
      color: $primary-color;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .comments-list {
    .comment {
      padding: $spacing-md 0;
      border-bottom: 1px solid $border-color;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.btn-sm {
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-sm;
}
</style>
