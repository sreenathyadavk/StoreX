import { defineStore } from 'pinia'
import axios from 'axios'
import { apiUrl } from '../config/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        isAuthenticated: !!localStorage.getItem('user'),
        accessToken: sessionStorage.getItem('accessToken') || null
    }),
    actions: {
        async login(username, password) {
            try {
                const response = await axios.post(apiUrl('login'), {
                    username,
                    password
                }, {
                    withCredentials: true // Important for cookies
                })

                if (response.status === 200) {
                    this.user = { username }
                    this.isAuthenticated = true
                    this.accessToken = response.data.accessToken
                    localStorage.setItem('user', JSON.stringify(this.user))
                    sessionStorage.setItem('accessToken', response.data.accessToken)
                    return true
                }
            } catch (error) {
                console.error('Login failed', error)
                throw error
            }
        },
        async register(username, password) {
            try {
                await axios.post(apiUrl('register'), { username, password })
                return true
            } catch (error) {
                console.error('Registration failed', error)
                throw error
            }
        },
        async refreshAccessToken() {
            try {
                const response = await axios.post(apiUrl('refresh'), {}, {
                    withCredentials: true
                })
                this.accessToken = response.data.accessToken
                sessionStorage.setItem('accessToken', response.data.accessToken)
                return response.data.accessToken
            } catch (error) {
                console.error('Token refresh failed', error)
                // If refresh fails, logout user
                this.logout()
                throw error
            }
        },
        async logout() {
            try {
                await axios.post(apiUrl('logout'), {}, { withCredentials: true })
            } catch (error) {
                console.error('Logout failed', error)
            } finally {
                this.user = null
                this.isAuthenticated = false
                this.accessToken = null
                localStorage.removeItem('user')
                sessionStorage.removeItem('accessToken')
            }
        },
        setAccessToken(token) {
            this.accessToken = token
        },
        async initialize() {
            // If user is marked as authenticated but has no access token,
            // try to refresh using the refresh token cookie
            if (this.isAuthenticated && !this.accessToken) {
                try {
                    await this.refreshAccessToken()
                } catch (error) {
                    // If refresh fails, clear the invalid session
                    console.warn('Failed to restore session, logging out')
                    this.user = null
                    this.isAuthenticated = false
                    this.accessToken = null
                    localStorage.removeItem('user')
                }
            }
        }
    }
})
