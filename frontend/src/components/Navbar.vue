<script setup>
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useRouter } from 'vue-router'
import { Sun, Moon, LogOut, Menu, X } from 'lucide-vue-next'
import { ref } from 'vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="navbar-brand" @click="closeMenu">CloudStorage</router-link>
      
      <button class="mobile-menu-btn" @click="toggleMenu">
        <X v-if="isMenuOpen" size="24" />
        <Menu v-else size="24" />
      </button>

      <div class="navbar-links" :class="{ 'active': isMenuOpen }">
        <router-link to="/" class="nav-link" @click="closeMenu">Home</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/dashboard" class="nav-link" @click="closeMenu">Dashboard</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/account" class="nav-link" @click="closeMenu">Account</router-link>
        
        <button @click="themeStore.toggleTheme" class="theme-toggle-btn" title="Toggle Theme">
          <Sun v-if="themeStore.theme === 'dark'" size="20" />
          <Moon v-else size="20" />
          <span class="mobile-only">Toggle Theme</span>
        </button>

        <div v-if="!authStore.isAuthenticated" class="auth-links">
          <router-link to="/login" class="nav-link" @click="closeMenu">Login</router-link>
          <router-link to="/signup" class="btn btn-sm" @click="closeMenu">Sign Up</router-link>
        </div>
        
        <div v-else class="auth-links">
          <button @click="handleLogout" class="btn btn-sm btn-outline">
            <LogOut size="16" style="margin-right: 4px;" /> Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary-color);
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle-btn {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle-btn:hover {
  background-color: var(--background-color);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-only {
  display: none;
  margin-left: 0.5rem;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }

  .navbar-links {
    position: fixed;
    top: 73px; /* Height of navbar */
    left: 0;
    width: 100%;
    height: calc(100vh - 73px);
    background-color: var(--card-bg);
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
    border-bottom: none;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    box-shadow: none;
    z-index: 999;
    overflow-y: auto;
  }

  .navbar-links.active {
    transform: translateX(0);
  }

  .auth-links {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }

  .nav-link {
    font-size: 1.1rem;
    width: 100%;
    text-align: center;
    padding: 0.5rem;
  }

  .btn, .btn-sm {
    width: 100%;
    justify-content: center;
  }

  .theme-toggle-btn {
    width: 100%;
    justify-content: center;
    border-radius: var(--radius);
    background-color: var(--background-color);
  }

  .mobile-only {
    display: inline;
  }
}
</style>
