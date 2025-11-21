import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

import axios from 'axios'
import { useModalStore } from './stores/modal'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Global Error Handler
app.config.errorHandler = (err, instance, info) => {
    console.error('Global Error:', err)
    const modalStore = useModalStore()
    modalStore.showError(err.message || 'An unexpected error occurred.')
}

// Axios Request Interceptor - Add JWT token to requests
axios.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        if (authStore.accessToken) {
            config.headers.Authorization = `Bearer ${authStore.accessToken}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Axios Response Interceptor - Handle token refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const modalStore = useModalStore()
        const authStore = useAuthStore()

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return axios(originalRequest)
                }).catch(err => {
                    return Promise.reject(err)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const newToken = await authStore.refreshAccessToken()
                processQueue(null, newToken)
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return axios(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                modalStore.showError('Session expired. Please login again.')
                router.push('/login')
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Show all other errors
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred.'
        modalStore.showError(message)

        return Promise.reject(error)
    }
)

// Initialize auth store (attempt to restore session with refresh token)
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
