# Cloud File Storage - Frontend

A modern, responsive file storage web application built with Vue.js 3, featuring JWT authentication, real-time upload progress, and beautiful UI.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication with auto-refresh
- **File Management** - Upload, download, preview, and delete files
- **Media Preview** - Images, videos, audio, PDFs, and text files
- **Upload Progress** - Real-time progress bar during uploads
- **Dark/Light Theme** - Toggle between themes with persistence
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Global Error Handling** - Themed modal dialogs for all errors
- **Secure Media Loading** - Blob URLs with JWT authentication

## 📋 Prerequisites

- **Node.js 16+** and **npm 8+**
- Backend API running on `http://localhost:8080`

## 🛠️ Tech Stack

- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next-generation frontend tooling
- **Vue Router** - Official router
- **Pinia** - State management
- **Axios** - HTTP client
- **Lucide Vue Next** - Beautiful icons

## ⚙️ Installation

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
VITE_API_URL=http://localhost:8080
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   │   ├── GlobalModal.vue
│   │   ├── Navbar.vue
│   │   └── VideoPlayer.vue
│   ├── stores/          # Pinia stores
│   │   ├── auth.js      # Authentication state
│   │   ├── theme.js     # Theme state
│   │   └── modal.js     # Modal state
│   ├── views/           # Page components
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Signup.vue
│   │   ├── Dashboard.vue
│   │   ├── Account.vue
│   │   └── NotFound.vue
│   ├── router/          # Vue Router configuration
│   │   └── index.js
│   ├── config/          # App configuration
│   │   └── api.js       # API URL configuration
│   ├── App.vue          # Root component
│   ├── main.js          # App entry point
│   └── style.css        # Global styles
├── .env                 # Environment variables
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## 🎨 Features in Detail

### Authentication

**JWT-based authentication with automatic token refresh:**

- Access tokens stored in sessionStorage (15 min expiry)
- Refresh tokens in httpOnly cookies (30 days)
- Automatic token refresh on 401 errors
- Persistent login across page refreshes

**Login Flow:**
```javascript
// stores/auth.js
await authStore.login(username, password)
// → Receives access token
// → Stores in sessionStorage
// → Redirects to dashboard
```

### File Upload

**Features:**
- Drag & drop support
- Real-time progress bar
- File type validation
- Size limit enforcement

**Upload with Progress:**
```javascript
await axios.post(apiUrl('upload'), formData, {
  onUploadProgress: (progressEvent) => {
    uploadProgress.value = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    )
  }
})
```

### Media Preview

**Supported Formats:**
- **Images**: JPG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, OGG
- **Audio**: MP3, WAV, OGG
- **Documents**: PDF, TXT

**Secure Loading:**
Files are loaded using blob URLs created from authenticated axios requests:
```javascript
const response = await axios.get(apiUrl(`view/${fileId}`), {
  responseType: 'blob',
  withCredentials: true
})
const blobUrl = URL.createObjectURL(response.data)
```

### Theme System

**Dark/Light mode with CSS variables:**

```css
/* Light Theme */
--background-color: #f8f9fa;
--text-color: #212529;

/* Dark Theme */
--background-color: #1a1a1a;
--text-color: #e9ecef;
```

Toggle theme:
```javascript
themeStore.toggleTheme()
```

### Global Error Handling

**Axios Interceptor:**
```javascript
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Try to refresh token
      await authStore.refreshAccessToken()
      // Retry original request
      return axios(originalRequest)
    }
    // Show error modal
    modalStore.showError(error.message)
  }
)
```

## 🎯 State Management

### Auth Store
```javascript
{
  user: { username: 'john' },
  isAuthenticated: true,
  accessToken: 'eyJhbGc...'
}
```

### Theme Store
```javascript
{
  theme: 'dark' // or 'light'
}
```

### Modal Store
```javascript
{
  isVisible: true,
  title: 'Error',
  message: 'Something went wrong',
  type: 'error', // 'success', 'info', 'error'
  onClose: () => {}
}
```

## 🛣️ Routing

```javascript
{
  '/': Home,
  '/login': Login,
  '/signup': Signup,
  '/dashboard': Dashboard (protected),
  '/account': Account (protected),
  '/:pathMatch(.*)': NotFound
}
```

**Route Guards:**
```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authStore.accessToken) {
    next('/login')
  } else {
    next()
  }
})
```

## 🎨 Styling

### CSS Variables
All colors and spacing use CSS custom properties for easy theming:

```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --radius: 12px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
}
```

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

## 🔐 Security

### Token Storage
- **Access Token**: sessionStorage (cleared on tab close)
- **Refresh Token**: httpOnly cookie (XSS protection)

### CORS
Frontend requests include credentials:
```javascript
axios.defaults.withCredentials = true
```

### Input Validation
- Username: 3-50 characters
- Password: minimum 6 characters
- Client-side validation before API calls

## 🧪 Development

### Hot Module Replacement
Vite provides instant HMR for fast development:
```bash
npm run dev
```

### Linting
```bash
npm run lint
```

## 📦 Dependencies

### Core
- `vue`: ^3.3.4
- `vue-router`: ^4.2.5
- `pinia`: ^2.1.7
- `axios`: ^1.6.0

### UI
- `lucide-vue-next`: ^0.294.0

### Dev Dependencies
- `vite`: ^5.0.0
- `@vitejs/plugin-vue`: ^4.5.0

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## ⚙️ Environment Variables

### Development (.env)
```env
VITE_API_URL=http://localhost:8080
```

### Production (.env.production)
```env
VITE_API_URL=https://api.yourapp.com
```

## 🎯 Performance Optimizations

1. **Code Splitting** - Routes are lazy-loaded
2. **Blob URL Cleanup** - Memory leaks prevented
3. **Debounced Search** - Reduced API calls
4. **Image Optimization** - Thumbnails pre-loaded
5. **Tree Shaking** - Unused code removed

## 🐛 Troubleshooting

### CORS Errors
Ensure backend allows frontend origin in SecurityConfig.

### 401 Errors
Check if access token is being sent in Authorization header.

### Upload Failures
Verify file size limits match backend configuration.

## 📝 Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

**Sreenath**
