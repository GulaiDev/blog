<template>
  <div class="profile">
    <div class="card">
      <h1 class="text-center mb-4">个人中心</h1>
      <div class="user-info">
        <h2>基本信息</h2>
        <p><strong>用户名：</strong>{{ userStore.getUserInfo.username }}</p>
        <p>
          <strong>注册时间：</strong
          >{{ formatDate(userStore.getUserInfo.created_at) }}
        </p>
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          :class="{ active: currentTab === tab.id }"
          class="tab-btn"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="tab-content">
        <!-- 我的文章 -->
        <div v-if="currentTab === 'articles'" class="articles-list">
          <div v-if="loading" class="text-center">加载中...</div>
          <div v-else-if="error" class="error-message">{{ error }}</div>
          <template v-else>
            <div v-if="articles.length === 0" class="empty-message">
              还没有发布过文章
            </div>
            <article
              v-for="article in articles"
              :key="article.id"
              class="article-item"
            >
              <h3>
                <router-link :to="`/article/${article.id}`">{{
                  article.title
                }}</router-link>
              </h3>
              <div class="article-meta">
                <span class="date"
                  >发布时间：{{ formatDate(article.created_at) }}</span
                >
                <span class="views">浏览：{{ article.views }}</span>
                <span class="comments">评论：{{ article.comments_count }}</span>
                <span class="favorites"
                  >收藏：{{ article.favorites_count }}</span
                >
                <span class="rating"
                  >评分：{{ Number(article.rating).toFixed(1) }}</span
                >
              </div>
              <div class="article-actions">
                <router-link
                  :to="`/article/edit/${article.id}`"
                  class="btn btn--secondary btn-sm"
                >
                  编辑
                </router-link>
                <button
                  @click="deleteArticle(article.id)"
                  class="btn btn--secondary btn-sm"
                >
                  删除
                </button>
              </div>
            </article>
          </template>
        </div>

        <!-- 我的收藏 -->
        <div v-if="currentTab === 'favorites'" class="favorites-list">
          <div v-if="loading" class="text-center">加载中...</div>
          <div v-else-if="error" class="error-message">{{ error }}</div>
          <template v-else>
            <div v-if="favorites.length === 0" class="empty-message">
              还没有收藏任何文章
            </div>
            <article
              v-for="article in favorites"
              :key="article.id"
              class="article-item"
            >
              <h3>
                <router-link :to="`/article/${article.id}`">{{
                  article.title
                }}</router-link>
              </h3>
              <div class="article-meta">
                <span class="author">作者：{{ article.author }}</span>
                <span class="date"
                  >发布时间：{{ formatDate(article.created_at) }}</span
                >
                <span class="views">浏览：{{ article.views }}</span>
                <span class="comments">评论：{{ article.comments_count }}</span>
                <span class="favorites"
                  >收藏：{{ article.favorites_count }}</span
                >
                <span class="rating"
                  >评分：{{ Number(article.rating).toFixed(1) }}</span
                >
              </div>
              <div class="article-actions">
                <button
                  @click="toggleFavorite(article)"
                  class="btn btn--secondary btn-sm"
                >
                  取消收藏
                </button>
              </div>
            </article>
          </template>
        </div>

        <!-- 我的评论 -->
        <div v-if="currentTab === 'comments'" class="comments-list">
          <div v-if="loading" class="text-center">加载中...</div>
          <div v-else-if="error" class="error-message">{{ error }}</div>
          <template v-else>
            <div v-if="comments.length === 0" class="empty-message">
              还没有发表过评论
            </div>
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-meta">
                <span class="article">
                  文章：
                  <router-link :to="`/article/${comment.article_id}`">
                    {{ comment.article_title }}
                  </router-link>
                </span>
                <span class="date"
                  >评论时间：{{ formatDate(comment.created_at) }}</span
                >
              </div>
              <div class="comment-actions">
                <button
                  @click="deleteComment(comment.id)"
                  class="btn btn--secondary btn-sm"
                >
                  删除
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { get, del, post } from "@/utils/request";

const router = useRouter();
const userStore = useUserStore();
console.log(userStore.getUserInfo);
const tabs = [
  { id: "articles", name: "我的文章" },
  { id: "favorites", name: "我的收藏" },
  { id: "comments", name: "我的评论" },
];

const currentTab = ref("articles");
const loading = ref(true);
const error = ref("");
const articles = ref([]);
const favorites = ref([]);
const comments = ref([]);

const fetchData = async () => {
  try {
    loading.value = true;
    error.value = "";

    switch (currentTab.value) {
      case "articles":
        const articlesResponse = await get("/articles/my");
        articles.value = articlesResponse.articles;
        break;
      case "favorites":
        const favoritesResponse = await get("/articles/favorites");
        favorites.value = favoritesResponse.articles;
        break;
      case "comments":
        const commentsResponse = await get("/comments/my");
        comments.value = commentsResponse.comments;
        break;
    }
  } catch (err) {
    error.value = "获取数据失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteArticle = async (articleId) => {
  if (!confirm("确定要删除这篇文章吗？")) return;

  try {
    await del(`/articles/${articleId}`);
    articles.value = articles.value.filter(
      (article) => article.id !== articleId
    );
  } catch (err) {
    console.error("删除文章失败:", err);
  }
};

const toggleFavorite = async (article) => {
  try {
    await del(`/articles/${article.id}/favorite`);
    favorites.value = favorites.value.filter(
      (article) => article.id !== article.id
    );
  } catch (err) {
    console.error("取消收藏失败:", err);
  }
};

const deleteComment = async (commentId) => {
  if (!confirm("确定要删除这条评论吗？")) return;

  try {
    await del(`/comments/${commentId}`);
    comments.value = comments.value.filter((c) => c.id !== commentId);
  } catch (err) {
    console.error("删除评论失败:", err);
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

watch(currentTab, fetchData);

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;

  .user-info {
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $border-color;

    h2 {
      margin-bottom: $spacing-md;
    }

    p {
      margin-bottom: $spacing-sm;
    }
  }

  .tabs {
    display: flex;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;

    .tab-btn {
      padding: $spacing-sm $spacing-md;
      border: none;
      background: none;
      cursor: pointer;
      color: $text-light;
      border-bottom: 2px solid transparent;

      &.active {
        color: $primary-color;
        border-bottom-color: $primary-color;
      }
    }
  }

  .article-item {
    padding: $spacing-md 0;
    border-bottom: 1px solid $border-color;

    &:last-child {
      border-bottom: none;
    }

    h3 {
      margin-bottom: $spacing-sm;

      a {
        color: $text-color;
        text-decoration: none;

        &:hover {
          color: $primary-color;
        }
      }
    }

    .article-meta {
      color: $text-light;
      font-size: $font-size-sm;
      margin-bottom: $spacing-sm;

      span {
        margin-right: $spacing-md;
      }
    }

    .article-actions {
      display: flex;
      gap: $spacing-sm;
    }
  }

  .comment-item {
    padding: $spacing-md 0;
    border-bottom: 1px solid $border-color;

    &:last-child {
      border-bottom: none;
    }

    .comment-content {
      margin-bottom: $spacing-sm;
      white-space: pre-wrap;
    }

    .comment-meta {
      color: $text-light;
      font-size: $font-size-sm;
      margin-bottom: $spacing-sm;

      span {
        margin-right: $spacing-md;
      }

      a {
        color: $primary-color;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .empty-message {
    text-align: center;
    color: $text-light;
    padding: $spacing-lg 0;
  }
}

.btn-sm {
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-sm;
}
</style>
