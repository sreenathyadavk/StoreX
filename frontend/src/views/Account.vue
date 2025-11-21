<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useModalStore } from '../stores/modal'
import { apiUrl } from '../config/api'
import { useRouter } from 'vue-router'
import { User, Lock, AlertTriangle, Trash2 } from 'lucide-vue-next'

const authStore = useAuthStore()
const modalStore = useModalStore()
const router = useRouter()

// Refs for profile
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const loading = ref(false)

// Refs for delete account modal
const showDeleteModal = ref(false)
const deleteConfirmationInput = ref('')
const deleteError = ref('')

const openDeleteModal = () => {
  showDeleteModal.value = true
  deleteConfirmationInput.value = ''
  deleteError.value = ''
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const handleChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''
  loading.value = true

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'New password and confirmation do not match.'
    loading.value = false
    return
  }

  if (newPassword.value.length < 6) { // Changed from 8 to 6
    passwordError.value = 'Password must be at least 6 characters.'
    loading.value = false
    return
  }

  try {
    await axios.put(apiUrl('change-password'), {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    }, { withCredentials: true })

    passwordSuccess.value = 'Password updated successfully!'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    passwordError.value = error.response?.data?.message || 'Failed to update password.'
  } finally {
    loading.value = false
  }
}

const confirmDeleteAccount = async () => {
  if (deleteConfirmationInput.value !== 'DELETE') {
    deleteError.value = 'Please type "DELETE" exactly to confirm.'
    return
  }

  try {
    await axios.delete(apiUrl('delete-account'), { withCredentials: true })
    await authStore.logout()
    
    modalStore.showSuccess('Your account has been deleted successfully.', () => {
        router.push('/login')
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    modalStore.showError('Failed to delete account. Please try again.')
  }
}
</script>

<template>
  <div class="container account-container">
    <h1>Account Settings</h1>
    
    <div class="account-grid">
      <!-- Profile Section -->
      <div class="card profile-card">
        <div class="card-header">
          <User size="24" />
          <h2>Profile</h2>
        </div>
        <div class="card-body">
          <div class="info-group">
            <label>Username</label>
            <p class="info-value">{{ authStore.user?.username }}</p>
          </div>
          <div class="info-group">
            <label>Role</label>
            <p class="info-value">User</p>
          </div>
        </div>
      </div>

      <!-- Change Password Section -->
      <div class="card password-card">
        <div class="card-header">
          <Lock size="24" />
          <h2>Change Password</h2>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleChangePassword">
            <div class="form-group">
              <label class="form-label">Current Password</label>
              <input 
                type="password" 
                v-model="currentPassword" 
                class="form-input" 
                required
              >
            </div>
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input 
                type="password" 
                v-model="newPassword" 
                class="form-input" 
                required
              >
            </div>
            <div class="form-group">
              <label class="form-label">Confirm New Password</label>
              <input 
                type="password" 
                v-model="confirmPassword" 
                class="form-input" 
                required
              >
            </div>
            
            <div v-if="passwordError" class="alert alert-error">{{ passwordError }}</div>
            <div v-if="passwordSuccess" class="alert alert-success">{{ passwordSuccess }}</div>
            
            <button type="submit" class="btn" :disabled="loading">
              {{ loading ? 'Updating...' : 'Update Password' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card danger-card">
        <div class="card-header danger-header">
          <AlertTriangle size="24" />
          <h2>Danger Zone</h2>
        </div>
        <div class="card-body">
          <p class="danger-text">Once you delete your account, there is no going back. Please be certain.</p>
          <button @click="openDeleteModal" class="btn btn-danger">
            <Trash2 size="18" style="margin-right: 8px;" />
            Delete Account
          </button>
        </div>
      </div>
      </div>


    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <AlertTriangle size="24" class="text-danger" />
          <h2>Delete Account?</h2>
        </div>
        <div class="modal-body">
          <p>This action cannot be undone. This will permanently delete your account and remove all your files from our servers.</p>
          <p>Please type <strong>DELETE</strong> to confirm.</p>
          
          <input 
            type="text" 
            v-model="deleteConfirmationInput" 
            class="form-input" 
            placeholder="Type DELETE"
          >
          
          <div v-if="deleteError" class="alert alert-error mt-4">{{ deleteError }}</div>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn btn-outline">Cancel</button>
          <button 
            @click="confirmDeleteAccount" 
            class="btn btn-danger"
            :disabled="deleteConfirmationInput !== 'DELETE'"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-container {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.account-grid {
  display: grid;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background-color: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.card-body {
  padding: 1.5rem;
}

.info-group {
  margin-bottom: 1rem;
}

.info-group label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.alert {
  padding: 0.75rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.alert-error {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

.alert-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border: 1px solid var(--success-color);
}

.danger-header {
  color: var(--danger-color);
}

.danger-text {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-danger:hover {
  background-color: #dc2626;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: var(--card-bg);
  border-radius: var(--radius);
  width: 100%;
  max-width: 450px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--danger-color);
}

.text-danger {
  color: var(--danger-color);
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.mt-4 {
  margin-top: 1rem;
}

.modal-footer {
  padding: 1.5rem;
  background-color: var(--background-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--border-color);
}
</style>
