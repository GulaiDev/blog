<template>
  <div class="app">
    <NavList />
    <main class="main-content">
      <div class="container">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import NavList from "./components/NavList.vue";
</script>

<style lang="scss" scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: $spacing-lg 0;
}
</style>
