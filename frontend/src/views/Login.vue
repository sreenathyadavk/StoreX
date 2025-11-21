<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username.value, password.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container" style="max-width: 400px; margin-top: 2rem;">
    <div class="header" style="text-align: center; margin-bottom: 2rem;">
      <h1>Login</h1>
    </div>
    
    <form @submit.prevent="handleLogin" class="card">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      
      <div class="form-group">
        <label for="username" class="form-label">Username</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          class="form-input" 
          required 
          autofocus
        >
      </div>
      
      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          class="form-input" 
          required
        >
      </div>
      
      <button type="submit" class="btn" style="width: 100%;" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      
      <div style="margin-top: 1rem; text-align: center;">
        <p>Don't have an account? <router-link to="/signup">Sign up here</router-link></p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}

.alert {
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
}

.alert-danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}
</style>
