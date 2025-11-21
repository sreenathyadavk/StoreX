<script setup>
import { AlertOctagon } from 'lucide-vue-next'
</script>

<template>
  <div class="not-found-container">
    <div class="content">
      <AlertOctagon size="64" class="icon" />
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <router-link to="/" class="btn btn-primary">Go Home</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  text-align: center;
}

.content {
  background-color: var(--card-bg);
  padding: 3rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 90%;
}

.icon {
  color: var(--danger-color);
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 4rem;
  margin: 0;
  line-height: 1;
  color: var(--text-color);
}

h2 {
  font-size: 1.5rem;
  margin: 1rem 0;
  color: var(--text-muted);
}

p {
  margin-bottom: 2rem;
  color: var(--text-muted);
}

.btn-primary {
  display: inline-block;
  text-decoration: none;
}
</style>
