<template>
  <article
    v-for="article in props.articles"
    :key="article.id"
    class="card article-card"
  >
    <h2 class="article-title">
      <router-link :to="`/article/${article.id}`">{{
        article.title
      }}</router-link>
    </h2>
    <div class="article-meta">
      <span class="author">作者：{{ article.author }}</span>
      <span class="date">发布时间：{{ formatDate(article.created_at) }}</span>
      <span class="views">浏览：{{ article.views }}</span>
    </div>
    <p class="article-summary">{{ article.content.substring(0, 200) }}...</p>
    <div class="article-footer">
      <div class="article-stats">
        <span class="comments">评论：{{ article.comments_count }}</span>
        <span class="favorites">收藏：{{ article.favorites_count }}</span>
        <span class="rating"
          >评分：{{ Number(article.rating).toFixed(1) }}</span
        >
      </div>
      <button
        v-if="userStore.isLoggedIn"
        @click="toggleFavorite(article)"
        class="btn btn--secondary"
      >
        {{ article.is_favorite ? "取消收藏" : "收藏" }}
      </button>
    </div>
  </article>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";

const userStore = useUserStore();

const props = defineProps({
  articles: {
    type: Array,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.article-card {
  .article-title {
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
    margin-bottom: $spacing-md;

    span {
      margin-right: $spacing-md;
    }
  }

  .article-summary {
    color: $text-light;
    margin-bottom: $spacing-md;
    line-height: 1.6;
  }

  .article-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .article-stats {
      color: $text-light;
      font-size: $font-size-sm;

      span {
        margin-right: $spacing-md;
      }
    }
  }
}
</style>
