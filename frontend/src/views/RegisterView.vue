<template>
  <div class="register-page">
    <div class="card register-card">
      <h1 class="text-center mb-4">注册</h1>
      <form @submit.prevent="handleSubmit" class="register-form">
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

        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            required
            placeholder="请再次输入密码"
          />
        </div>

        <div class="error-message" v-if="error">{{ error }}</div>

        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? "注册中..." : "注册" }}
        </button>

        <div class="text-center mt-3">
          <router-link to="/login" class="login-link">
            已有账号？立即登录
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { post } from "@/utils/request";

const router = useRouter();

const form = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

const loading = ref(false);
const error = ref("");

const handleSubmit = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = "两次输入的密码不一致";
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    await post("/auth/register", {
      username: form.value.username,
      password: form.value.password,
    });

    router.push("/login");
  } catch (err) {
    error.value = err.message || "注册失败，请重试";
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.register-form {
  .error-message {
    color: $error-color;
    margin-bottom: $spacing-md;
  }

  .login-link {
    color: $primary-color;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
