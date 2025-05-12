<template>
  <nav class="navbar">
    <div class="container">
      <router-link to="/" class="logo">博客系统</router-link>
      <div class="nav-links">
        <div v-if="userStore.isLoggedIn">
          <router-link to="/article/new" class="nav-link">写文章</router-link>
          <router-link to="/profile" class="nav-link">个人中心</router-link>
          <button @click="handleLogout" class="btn btn--secondary">
            退出登录
          </button>
        </div>
        <div v-else>
          <router-link to="/login" class="nav-link">登录</router-link>
          <router-link to="/register" class="nav-link">注册</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>
<script setup>
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

const handleLogout = () => {
  userStore.logout();
  router.push("/login");
};
</script>
<style lang="scss" scoped>
.navbar {
  background-color: $white;
  box-shadow: $box-shadow;
  padding: $spacing-md 0;

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: $font-size-xl;
    font-weight: bold;
    color: $primary-color;
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    gap: $spacing-md;
    align-items: center;
  }

  .nav-link {
    color: $text-color;
    text-decoration: none;
    padding: $spacing-xs $spacing-sm;

    &:hover {
      color: $primary-color;
    }
  }
}
</style>
