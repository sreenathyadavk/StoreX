<script setup>
import { useModalStore } from '../stores/modal'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-vue-next'

const modalStore = useModalStore()

const handleClose = () => {
  if (modalStore.onClose) {
    modalStore.onClose()
  }
  modalStore.hideModal()
}

const handleConfirm = () => {
  if (modalStore.onClose) {
    modalStore.onClose()
  }
  modalStore.hideModal()
}

const handleCancel = () => {
  modalStore.hideModal()
}
</script>

<template>
  <div v-if="modalStore.isVisible" class="modal-overlay">
    <div class="modal-content" :class="modalStore.type">
      <div class="modal-header">
        <div class="header-title">
            <AlertCircle v-if="modalStore.type === 'error'" size="24" />
            <CheckCircle v-else-if="modalStore.type === 'success'" size="24" />
            <Info v-else size="24" />
            <h2>{{ modalStore.title }}</h2>
        </div>
        <button class="close-btn" @click="handleCancel">
          <X :size="20" />
        </button>
      </div>
      <div class="modal-body">
        <p>{{ modalStore.message }}</p>
      </div>
      <div class="modal-footer">
        <button
          v-if="modalStore.onConfirm || modalStore.onCancel"
          class="btn btn-secondary"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          class="btn"
          :class="modalStore.type === 'error' ? 'btn-danger' : 'btn-primary'"
          @click="handleConfirm"
        >
          {{ modalStore.onConfirm ? 'Confirm' : 'OK' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  z-index: 2000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background-color: var(--card-bg);
  border-radius: var(--radius);
  width: 100%;
  max-width: 450px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

.modal-body {
  padding: 1.5rem;
  color: var(--text-color);
  line-height: 1.5;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background-color: var(--background-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.modal-footer .btn {
  min-width: 100px;
}

.btn-secondary {
  background: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--hover-bg);
}

.btn-danger {
  background: var(--danger-color);
}

.btn-danger:hover {
  background: #dc2626;
}

/* Type-specific styles */
.error .modal-header h2, .error .header-title { color: var(--danger-color); }
.success .modal-header h2, .success .header-title { color: var(--success-color); }
.info .modal-header h2, .info .header-title { color: var(--primary-color); }

.btn-error { background-color: var(--danger-color); color: white; }
.btn-error:hover { background-color: #dc2626; }

.btn-success { background-color: var(--success-color); color: white; }
.btn-success:hover { background-color: #059669; }

.btn-info { background-color: var(--primary-color); color: white; }
.btn-info:hover { background-color: var(--primary-hover); }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
