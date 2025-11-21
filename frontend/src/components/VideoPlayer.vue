<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-vue-next'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const videoRef = ref(null)
const containerRef = ref(null)
const isPlaying = ref(false)
const progress = ref(0)
const currentTime = ref('0:00')
const duration = ref('0:00')
const volume = ref(1)
const isMuted = ref(false)
const isFullscreen = ref(false)

const togglePlay = async () => {
  if (!videoRef.value) return
  
  try {
    if (videoRef.value.paused) {
      // Check if video has a valid source before playing
      if (videoRef.value.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        await videoRef.value.play()
        isPlaying.value = true
      } else {
        console.warn('Video source not ready yet for playback.')
      }
    } else {
      videoRef.value.pause()
      isPlaying.value = false
    }
  } catch (error) {
    console.error('Error during video playback:', error)
    // Silently handle the error - video might not be ready yet or user gesture required
    isPlaying.value = false // Assume it's not playing if an error occurred
  }
}

const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

const updateProgress = () => {
  const vid = videoRef.value
  if (!vid) return
  const percent = (vid.currentTime / vid.duration) * 100
  progress.value = percent
  currentTime.value = formatTime(vid.currentTime)
  duration.value = formatTime(vid.duration)
}

const seek = (e) => {
  const progressBar = e.currentTarget
  const clickPosition = e.offsetX
  const progressBarWidth = progressBar.offsetWidth
  const seekTime = (clickPosition / progressBarWidth) * videoRef.value.duration
  videoRef.value.currentTime = seekTime
}

const toggleMute = () => {
  if (isMuted.value) {
    videoRef.value.volume = volume.value || 1
    isMuted.value = false
  } else {
    videoRef.value.volume = 0
    isMuted.value = true
  }
}

const handleVolumeChange = (e) => {
  const val = parseFloat(e.target.value)
  volume.value = val
  videoRef.value.volume = val
  isMuted.value = val === 0
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    containerRef.value.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

onMounted(() => {
  const vid = videoRef.value
  if (vid) {
    vid.addEventListener('timeupdate', updateProgress)
    vid.addEventListener('loadedmetadata', () => {
      duration.value = formatTime(vid.duration)
    })
  }
})

onUnmounted(() => {
  const vid = videoRef.value
  if (vid) {
    vid.removeEventListener('timeupdate', updateProgress)
  }
})
</script>

<template>
  <div ref="containerRef" class="video-player-container">
    <video ref="videoRef" :src="src" @click="togglePlay"></video>
    
    <div class="video-controls">
      <div class="progress-bar" @click="seek">
        <div class="progress-filled" :style="{ width: progress + '%' }"></div>
      </div>
      
      <div class="controls-row">
        <div class="left-controls">
          <button @click="togglePlay" class="control-btn">
            <Pause v-if="isPlaying" size="20" />
            <Play v-else size="20" />
          </button>
          
          <div class="volume-container">
            <button @click="toggleMute" class="control-btn">
              <VolumeX v-if="isMuted" size="20" />
              <Volume2 v-else size="20" />
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              :value="isMuted ? 0 : volume"
              @input="handleVolumeChange"
              class="volume-slider"
            >
          </div>
          
          <span class="time-display">{{ currentTime }} / {{ duration }}</span>
        </div>
        
        <button @click="toggleFullscreen" class="control-btn">
          <Minimize v-if="isFullscreen" size="20" />
          <Maximize v-else size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-player-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: #000;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  aspect-ratio: 16/9;
}

video {
  width: 100%;
  height: 100%;
  display: block;
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-player-container:hover .video-controls {
  opacity: 1;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.3);
  cursor: pointer;
  border-radius: 2px;
  position: relative;
}

.progress-filled {
  height: 100%;
  background: var(--primary-color);
  width: 0;
  border-radius: 2px;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  opacity: 0.8;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  opacity: 1;
}

.time-display {
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.volume-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}
</style>
