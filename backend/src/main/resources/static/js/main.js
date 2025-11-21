document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }
});

// Custom Video Player Logic
function initVideoPlayer(videoElement) {
    const container = videoElement.closest('.video-player-container');
    const playBtn = container.querySelector('.play-btn');
    const progressBar = container.querySelector('.progress-bar');
    const progressFilled = container.querySelector('.progress-filled');
    const timeDisplay = container.querySelector('.time-display');
    const volumeBtn = container.querySelector('.volume-btn');
    const volumeSlider = container.querySelector('.volume-slider');
    const fullscreenBtn = container.querySelector('.fullscreen-btn');

    // Play/Pause
    function togglePlay() {
        if (videoElement.paused) {
            videoElement.play();
            playBtn.innerHTML = '❚❚';
        } else {
            videoElement.pause();
            playBtn.innerHTML = '▶';
        }
    }

    playBtn.addEventListener('click', togglePlay);
    videoElement.addEventListener('click', togglePlay);

    // Progress
    videoElement.addEventListener('timeupdate', () => {
        const percent = (videoElement.currentTime / videoElement.duration) * 100;
        progressFilled.style.width = `${percent}%`;

        const current = formatTime(videoElement.currentTime);
        const total = formatTime(videoElement.duration);
        timeDisplay.textContent = `${current} / ${total}`;
    });

    progressBar.addEventListener('click', (e) => {
        const scrubTime = (e.offsetX / progressBar.offsetWidth) * videoElement.duration;
        videoElement.currentTime = scrubTime;
    });

    // Volume
    volumeSlider.addEventListener('input', (e) => {
        videoElement.volume = e.target.value;
        updateVolumeIcon(e.target.value);
    });

    function updateVolumeIcon(vol) {
        if (vol == 0) volumeBtn.textContent = '🔇';
        else if (vol < 0.5) volumeBtn.textContent = '🔉';
        else volumeBtn.textContent = '🔊';
    }

    volumeBtn.addEventListener('click', () => {
        if (videoElement.volume > 0) {
            videoElement.dataset.lastVolume = videoElement.volume;
            videoElement.volume = 0;
            volumeSlider.value = 0;
            updateVolumeIcon(0);
        } else {
            const lastVol = videoElement.dataset.lastVolume || 1;
            videoElement.volume = lastVol;
            volumeSlider.value = lastVol;
            updateVolumeIcon(lastVol);
        }
    });

    // Fullscreen
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Updated openPreview function
function openPreview(element) {
    const id = element.getAttribute('data-id');
    const contentType = element.getAttribute('data-type');
    const filename = element.getAttribute('data-filename');

    const modal = document.getElementById('previewModal');
    const container = document.getElementById('previewContainer');
    const title = document.getElementById('previewTitle');

    title.textContent = filename;
    container.innerHTML = ''; // Clear previous content

    if (contentType.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = `/view/${id}`;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '70vh';
        img.style.borderRadius = 'var(--radius)';
        container.appendChild(img);
    } else if (contentType.startsWith('video/')) {
        const playerHtml = `
            <div class="video-player-container">
                <video src="/view/${id}"></video>
                <div class="video-controls">
                    <div class="progress-bar">
                        <div class="progress-filled"></div>
                    </div>
                    <div class="controls-row">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <button class="control-btn play-btn">▶</button>
                            <div class="volume-container">
                                <button class="control-btn volume-btn">🔊</button>
                                <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="1">
                            </div>
                            <span class="time-display">0:00 / 0:00</span>
                        </div>
                        <button class="control-btn fullscreen-btn">⛶</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = playerHtml;
        const video = container.querySelector('video');
        video.addEventListener('loadedmetadata', () => initVideoPlayer(video));
    } else {
        container.innerHTML = '<p>Preview not available for this file type.</p>';
    }

    modal.style.display = 'block';
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    const container = document.getElementById('previewContainer');
    modal.style.display = 'none';
    container.innerHTML = ''; // Stop playback
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('previewModal');
    if (event.target == modal) {
        closePreview();
    }
}
