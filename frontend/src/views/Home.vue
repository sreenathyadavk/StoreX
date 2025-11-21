<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="container home-container">
    <div class="hero">
      <h1>Cloud File Storage</h1>
      <p class="subtitle">Secure, fast, and easy file storage for everyone.</p>
      
      <div v-if="!authStore.isAuthenticated" class="cta-buttons">
        <router-link to="/signup" class="btn btn-lg">Get Started</router-link>
        <router-link to="/login" class="btn btn-lg btn-outline">Login</router-link>
      </div>
      <div v-else class="cta-buttons">
        <router-link to="/dashboard" class="btn btn-lg">Go to Dashboard</router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <h3>Secure Storage</h3>
        <p>Your files are encrypted and stored safely.</p>
      </div>
      <div class="feature-card">
        <h3>Fast Uploads</h3>
        <p>Lightning fast upload speeds for all your files.</p>
      </div>
      <div class="feature-card">
        <h3>Anywhere Access</h3>
        <p>Access your files from any device, anywhere.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  text-align: center;
  padding-top: 4rem;
  padding-bottom: 4rem;
}

@media (max-width: 768px) {
  .home-container {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}

.hero {
  margin-bottom: 4rem;
  animation: fadeIn 1s ease-out;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(to right, var(--primary-color), #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: slideUp 0.8s ease-out;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
    line-height: 1.2;
  }
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
  animation: slideUp 0.8s ease-out 0.2s backwards;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  animation: slideUp 0.8s ease-out 0.4s backwards;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.feature-card {
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  transition: transform 0.2s;
  animation: slideUp 0.8s ease-out 0.6s backwards;
}

.feature-card:nth-child(2) {
  animation-delay: 0.7s;
}

.feature-card:nth-child(3) {
  animation-delay: 0.8s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: var(--text-muted);
}
</style>
