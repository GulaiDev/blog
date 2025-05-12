<template>
  <div class="new-article">
    <div class="card">
      <h1 class="text-center mb-4">写文章</h1>
      <form @submit.prevent="handleSubmit" class="article-form">
        <ArticleContent :form="form" />

        <div class="error-message" v-if="error">{{ error }}</div>

        <div class="form-actions">
          <button
            type="button"
            @click="router.back()"
            class="btn btn--secondary"
          >
            取消
          </button>
          <button type="submit" class="btn" :disabled="loading">
            {{ loading ? "发布中..." : "发布" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { post } from "@/utils/request";
import ArticleContent from "@/components/ArticleContent.vue";

const router = useRouter();

const form = ref({
  title: "",
  content: "",
});

const loading = ref(false);
const error = ref("");

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await post("/articles", form.value);
    router.push(`/article/${response.articleId}`);
  } catch (err) {
    error.value = err.message || "发布失败，请重试";
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.new-article {
  max-width: 800px;
  margin: 0 auto;

  .article-form {
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: $spacing-md;
      margin-top: $spacing-lg;
    }
  }
}
</style>
