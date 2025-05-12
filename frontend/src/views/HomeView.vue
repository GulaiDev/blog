<template>
  <div class="home-page">
    <div class="articles-list">
      <div v-if="loading" class="text-center">加载中...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else><Article :articles="articles" /></div>
    </div>
  </div>
</template>

<script setup>
import Article from "@/components/Article.vue";
import { ref, onMounted } from "vue";
import { get, post, del } from "@/utils/request";

const articles = ref([]);
const loading = ref(true);
const error = ref("");

const fetchArticles = async () => {
  try {
    loading.value = true;
    error.value = "";
    const response = await get("/articles");
    articles.value = response.articles;
  } catch (err) {
    error.value = "获取文章列表失败";
  } finally {
    loading.value = false;
  }
};

const toggleFavorite = async (article) => {
  try {
    if (article.is_favorite) {
      await del(`/articles/${article.id}/favorite`);
      article.is_favorite = false;
      article.favorites_count--;
    } else {
      await post(`/articles/${article.id}/favorite`);
      article.is_favorite = true;
      article.favorites_count++;
    }
  } catch (err) {
    console.error("收藏操作失败:", err);
  }
};

onMounted(() => {
  fetchArticles();
});
</script>

<style lang="scss" scoped>
.error-message {
  color: $error-color;
  text-align: center;
  margin: $spacing-lg 0;
}
</style>
