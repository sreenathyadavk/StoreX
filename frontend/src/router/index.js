import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Dashboard from '../views/Dashboard.vue'
import Account from '../views/Account.vue'
import NotFound from '../views/NotFound.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/signup',
            name: 'signup',
            component: Signup
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard,
            meta: { requiresAuth: true }
        },
        {
            path: '/account',
            name: 'account',
            component: Account,
            meta: { requiresAuth: true }
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: NotFound
        }
    ]
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
        // User must be authenticated AND have an access token
        if (!authStore.isAuthenticated || !authStore.accessToken) {
            next('/login')
            return
        }
    }

    // Redirect authenticated users away from login/signup
    if ((to.name === 'login' || to.name === 'signup') && authStore.isAuthenticated && authStore.accessToken) {
        next('/dashboard')
        return
    }

    next()
})

export default router
