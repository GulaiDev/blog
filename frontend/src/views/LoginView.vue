<template>
  <div class="login-page">
    <div class="card login-card">
      <h1 class="text-center mb-4">登录</h1>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            required
            placeholder="请输入用户名"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="请输入密码"
          />
        </div>

        <div class="error-message" v-if="error">{{ error }}</div>

        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? "登录中..." : "登录" }}
        </button>

        <div class="text-center mt-3">
          <router-link to="/register" class="register-link">
            还没有账号？立即注册
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { post } from "@/utils/request";

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  username: "",
  password: "",
});

const loading = ref(false);
const error = ref("");

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await post("/auth/login", form.value);
    userStore.setToken(response.token);
    userStore.setUserInfo(response.user);

    router.push("/");
  } catch (err) {
    error.value = err.message || "登录失败，请重试";
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-form {
  .error-message {
    color: $error-color;
    margin-bottom: $spacing-md;
  }

  .register-link {
    color: $primary-color;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
