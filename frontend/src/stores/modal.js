import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
    state: () => ({
        isVisible: false,
        title: '',
        message: '',
        type: 'info', // 'info', 'success', 'error'
        onClose: null
    }),
    actions: {
        showError(message, onClose = null) {
            this.title = 'Error'
            this.message = message || 'An unexpected error occurred.'
            this.type = 'error'
            this.isVisible = true
            this.onClose = onClose
        },
        showSuccess(message, onClose = null) {
            this.title = 'Success'
            this.message = message
            this.type = 'success'
            this.isVisible = true
            this.onClose = onClose
        },
        showModal(title, message, type = 'info', onClose = null) {
            this.title = title
            this.message = message
            this.type = type
            this.isVisible = true
            this.onClose = onClose
        },
        hideModal() {
            this.isVisible = false
            if (this.onClose) {
                this.onClose()
                this.onClose = null
            }
            // Reset state after transition
            setTimeout(() => {
                this.title = ''
                this.message = ''
                this.type = 'info'
            }, 300)
        }
    }
})
