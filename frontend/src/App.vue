<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import GlobalModal from './components/GlobalModal.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>

<template>
  <div class="app-container">
    <Navbar />
    <main class="main-content">
      <RouterView />
    </main>
    <GlobalModal />
  </div>
</template>

<style scoped>
.main-content {
  padding-top: 80px; /* Space for fixed navbar */
  min-height: 100vh;
  box-sizing: border-box;
}
</style>
