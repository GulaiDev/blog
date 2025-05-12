import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user", () => {
  const token = ref(localStorage.getItem("token") || "");
  const userInfo = ref(JSON.parse(localStorage.getItem("userInfo")) || null);

  function setToken(newToken) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  function setUserInfo(newUserInfo) {
    userInfo.value = newUserInfo;
    localStorage.setItem("userInfo", JSON.stringify(newUserInfo));
  }

  function logout() {
    token.value = "";
    userInfo.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  }

  const isLoggedIn = computed(() => !!token.value);
  const getUserInfo = computed(() => userInfo.value);

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
    isLoggedIn,
    getUserInfo,
  };
});
