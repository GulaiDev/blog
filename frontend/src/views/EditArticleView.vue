<template>
  <div class="edit-article">
    <div v-if="loading" class="text-center">加载中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else class="card">
      <h1 class="text-center mb-4">编辑文章</h1>
      <form @submit.prevent="handleSubmit" class="article-form">
        <ArticleContent :form="form" />

        <div class="error-message" v-if="submitError">{{ submitError }}</div>

        <div class="form-actions">
          <button
            type="button"
            @click="router.back()"
            class="btn btn--secondary"
          >
            取消
          </button>
          <button type="submit" class="btn" :disabled="submitting">
            {{ submitting ? "保存中..." : "保存" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { get, put } from "@/utils/request";
import ArticleContent from "@/components/ArticleContent.vue";

const route = useRoute();
const router = useRouter();

const form = ref({
  title: "",
  content: "",
});

const loading = ref(true);
const error = ref("");
const submitting = ref(false);
const submitError = ref("");

const fetchArticle = async () => {
  try {
    loading.value = true;
    error.value = "";
    const response = await get(`/articles/${route.params.id}`);
    form.value = {
      title: response.article.title,
      content: response.article.content,
    };
  } catch (err) {
    error.value = "获取文章失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    submitError.value = "";

    await put(`/articles/${route.params.id}`, form.value);
    router.push(`/article/${route.params.id}`);
  } catch (err) {
    submitError.value = err.message || "保存失败，请重试";
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchArticle();
});
</script>

<style lang="scss" scoped>
.edit-article {
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
