```
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useModalStore } from '../stores/modal'
import { apiUrl, API_BASE_URL } from '../config/api'
import VideoPlayer from '../components/VideoPlayer.vue'
import { Trash2, Eye, Download, FileText, Image as ImageIcon, Film, X, Upload } from 'lucide-vue-next'

const authStore = useAuthStore()
const modalStore = useModalStore()

const files = ref([])
const loading = ref(true)
const uploadLoading = ref(false)
const fileInput = ref(null)
const previewFile = ref(null)
const textContent = ref('')
const fileBlobUrls = ref({}) // Store blob URLs for media files
const storageUsage = ref(0)
const uploadProgress = ref(0) // Added uploadProgress ref


const createBlobUrl = async (fileId) => {
  if (fileBlobUrls.value[fileId]) {
    return fileBlobUrls.value[fileId]
  }
  
  try {
    const response = await axios.get(apiUrl(`view/${fileId}`), {
      responseType: 'blob',
      withCredentials: true
    })
    const blobUrl = URL.createObjectURL(response.data)
    fileBlobUrls.value[fileId] = blobUrl
    return blobUrl
  } catch (error) {
    console.error('Error creating blob URL:', error)
    return null
  }
}

const fetchFiles = async () => {
  try {
    const response = await axios.get(apiUrl('files'), { withCredentials: true })
    files.value = response.data
    
    // Pre-load blob URLs for image thumbnails
    for (const file of files.value) {
      if (file.contentType && file.contentType.startsWith('image/')) {
        await createBlobUrl(file.id)
      }
    }
    
    fetchStorageUsage()
  } catch (error) {
    console.error('Error fetching files:', error)
  } finally {
    loading.value = false
  }
}

const fetchStorageUsage = async () => {
  try {
    const response = await axios.get(apiUrl('usage'), { withCredentials: true })
    storageUsage.value = response.data.usage
  } catch (error) {
    console.error('Error fetching usage:', error)
  }
}

const handleFileUpload = async (event) => { // Renamed from handleUpload
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  uploadLoading.value = true
  uploadProgress.value = 0 // Reset progress
  try {
    await axios.post(apiUrl('upload'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: true,
      onUploadProgress: (progressEvent) => { // Track upload progress
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })
    fetchFiles() // No await needed here, as the original also didn't await it.
    event.target.value = '' // Clear file input
  } catch (error) {
    console.error('Upload failed:', error)
    modalStore.showError('Failed to upload file. Please try again.')
  } finally {
    uploadLoading.value = false
    uploadProgress.value = 0 // Reset progress
  }
}

const deleteFile = async (id) => {
  modalStore.showModal(
    'Delete File',
    'Are you sure you want to delete this file? This action cannot be undone.',
    'error',
    async () => {
      try {
        await axios.delete(apiUrl(`delete/${id}`), { withCredentials: true })
        files.value = files.value.filter(f => f.id !== id)
        
        // Revoke blob URL if it exists
        if (fileBlobUrls.value[id]) {
          URL.revokeObjectURL(fileBlobUrls.value[id])
          delete fileBlobUrls.value[id]
        }
        
        fetchStorageUsage()
        modalStore.showSuccess('File deleted successfully')
      } catch (error) {
        console.error('Error deleting file:', error)
        modalStore.showError('Failed to delete file. Please try again.')
      }
    }
  )
}

const openPreview = async (file) => {
  previewFile.value = file
  textContent.value = ''
  
  if (file.contentType && file.contentType.startsWith('text/')) {
    // Check file size before loading (limit to 1MB for text files)
    if (file.size > 1024 * 1024) {
        modalStore.showError('Text file is too large to preview (max 1MB). Please download it instead.')
        previewFile.value = null
        return
    }
    try {
      const response = await axios.get(apiUrl(`view/${file.id}`), { withCredentials: true })
      textContent.value = response.data
    } catch (error) {
      console.error('Error fetching text content:', error)
      modalStore.showError('Failed to load text file preview')
      previewFile.value = null
    }
  } else if (file.contentType && (file.contentType.startsWith('image/') || file.contentType.startsWith('video/') || file.contentType.startsWith('audio/'))) {
    // Create blob URL for media files if not already created
    await createBlobUrl(file.id)
  }
}

const closePreview = () => {
  previewFile.value = null
}

const downloadFile = async (file) => {
  try {
    const response = await axios.get(apiUrl(`download/${file.id}`), {
      responseType: 'blob',
      withCredentials: true
    })
    
    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file.filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
    // If response is a blob (because of responseType), try to read it as text to get error message
    if (error.response && error.response.data instanceof Blob) {
      const text = await error.response.data.text()
      try {
        const json = JSON.parse(text)
        // Re-throw with the parsed message so global handler or local catch can use it
        // But wait, global handler might not wait for this async parsing. 
        // We should manually show error here since we are in a specific "blob" context
        const modalStore = useModalStore() // We need to import this
        modalStore.showError(json.message || 'Failed to download file')
      } catch (e) {
        // If not JSON, just show generic error
        const modalStore = useModalStore()
        modalStore.showError('Failed to download file')
      }
    }
  }
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (contentType) => {
  if (!contentType) return FileText
  if (contentType.startsWith('image/')) return ImageIcon
  if (contentType.startsWith('video/')) return Film
  return FileText
}

onMounted(() => {
  fetchFiles()
})

onUnmounted(() => {
  // Clean up blob URLs to prevent memory leaks
  Object.values(fileBlobUrls.value).forEach(url => {
    URL.revokeObjectURL(url)
  })
})
</script>

<template>
  <div class="container dashboard-container">
    <div class="header">
      <div>
        <h1>My Files</h1>
        <p v-if="authStore.user" class="welcome-text">Welcome, {{ authStore.user.username }}</p>
        <!-- <p class="storage-info">Storage Used: {{ formatSize(storageUsage) }}</p> -->
      </div>
      <div class="upload-btn-wrapper">
          <!-- Upload Section -->
    <div class="upload-section">
      <div class="upload-container">
        <input 
          type="file" 
          @change="handleFileUpload" 
          id="fileInput" 
          :disabled="uploadLoading"
        >
        <label for="fileInput" class="upload-btn" :class="{ disabled: uploadLoading }">
          <Upload size="20" />
          {{ uploadLoading ? `Uploading... ${uploadProgress}%` : 'Upload File' }}
        </label>
      </div>
      
      <!-- Upload Progress Bar -->
      <div v-if="uploadLoading" class="upload-progress">
        <div class="progress-bar-container">
          <div class="progress-bar-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <span class="progress-text">{{ uploadProgress }}%</span>
      </div>

      <div class="storage-info">
        <p>Storage Used: {{ formatSize(storageUsage) }}</p>
      </div>
    </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading files...</div>
    
    <div v-else-if="files.length === 0" class="empty-state">
      <p>No files uploaded yet.</p>
    </div>

    <div v-else class="files-grid">
      <div v-for="file in files" :key="file.id" class="file-card">
        <div class="file-icon">
          <img 
            v-if="file.contentType && file.contentType.startsWith('image/') && fileBlobUrls[file.id]" 
            :src="fileBlobUrls[file.id]" 
            class="thumbnail"
            alt="thumbnail"
          >
          <component v-else :is="getFileIcon(file.contentType)" size="48" />
        </div>
        <div class="file-info">
          <h3 class="file-name" :title="file.filename">{{ file.filename }}</h3>
          <p class="file-meta">{{ formatSize(file.size) }} • {{ new Date(file.uploadDate).toLocaleDateString() }}</p>
        </div>
        <div class="file-actions">
          <button 
            v-if="file.contentType && (file.contentType.startsWith('image/') || file.contentType.startsWith('video/') || file.contentType.startsWith('audio/') || file.contentType === 'application/pdf' || file.contentType.startsWith('text/'))"
            @click="openPreview(file)" 
            class="action-btn" 
            title="Preview"
          >
            <Eye size="18" />
          </button>
          <button 
            @click="downloadFile(file)" 
            class="action-btn" 
            title="Download"
          >
            <Download size="18" />
          </button>
          <button @click="deleteFile(file.id)" class="action-btn delete-btn" title="Delete">
            <Trash2 size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="previewFile" class="modal-overlay" @click.self="closePreview">
      <div class="modal-content">
        <button class="close-btn" @click="closePreview">
          <X size="24" />
        </button>
        
        <div class="preview-container">
          <img 
            v-if="previewFile.contentType.startsWith('image/')" 
            :src="fileBlobUrls[previewFile.id]" 
            :alt="previewFile.filename"
          >
          <VideoPlayer 
            v-else-if="previewFile.contentType.startsWith('video/') && fileBlobUrls[previewFile.id]" 
            :src="fileBlobUrls[previewFile.id]" 
          />
          <audio 
            v-else-if="previewFile.contentType.startsWith('audio/')" 
            :src="fileBlobUrls[previewFile.id]" 
            controls
            style="width: 100%; max-width: 500px;"
          ></audio>
          <iframe 
            v-else-if="previewFile.contentType === 'application/pdf'" 
            :src="apiUrl(`view/${previewFile.id}`)" 
            width="100%" 
            height="600px"
            style="border: none;"
          ></iframe>
          <div 
            v-else-if="previewFile.contentType && previewFile.contentType.startsWith('text/')" 
            class="text-preview-content"
          >
            <pre>{{ textContent }}</pre>
          </div>
          <div v-else class="no-preview">
            <p>Preview not available for this file type.</p>
            <button @click="downloadFile(previewFile)" class="btn">Download to View</button>
          </div>
        </div>
        <div class="preview-footer">
          <h3>{{ previewFile.filename }}</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  /* Padding is handled by global container and main-content */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .upload-btn-wrapper, .btn {
    width: 100%;
  }
}

.upload-btn-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.upload-btn-wrapper input[type=file] {
  font-size: 100px;
  position: absolute;
  right: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 480px) {
  .files-grid {
    grid-template-columns: 1fr;
  }
}

.file-card {
  background-color: var(--card-bg);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.file-icon {
  color: var(--primary-color);
  margin-bottom: 1rem;
  background-color: rgba(79, 70, 229, 0.1);
  padding: 1rem;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-info {
  width: 100%;
  margin-bottom: 1rem;
  min-width: 0; /* Critical for text truncation in flex/grid */
}

.file-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  white-space: normal; /* Allow wrapping */
  word-break: break-word; /* Break long words if needed */
  line-height: 1.3;
}

.file-meta {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.action-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 0.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: var(--background-color);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.delete-btn:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 2rem;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 1rem;
  }
}

.modal-content {
  background-color: var(--card-bg);
  border-radius: var(--radius);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.preview-container {
  flex: 1;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-height: 400px;
}

.preview-container img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.upload-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-progress {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 45px;
  text-align: right;
}

.no-preview {
  text-align: center;
  color: white;
}

.storage-info {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.welcome-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.preview-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.preview-footer h3 {
  margin: 0;
  font-size: 1.1rem;
  word-break: break-word; /* Wrap long filenames in modal */
}

.text-preview-content {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
}

.text-preview-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  margin: 0;
}

.loading, .empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-muted);
  font-size: 1.1rem;
}
</style>
