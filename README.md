# TaskFlow – Cloud Task Manager

> A modern, responsive task management app built with React + Firebase, deployed on Vercel.

## 🚀 Live Demo

**[taskflow-app.vercel.app](https://taskflow-app.vercel.app)** _(update after deploy)_

---

## ✨ Features

- 🔐 **Authentication** – Email/password + Google OAuth via Firebase Auth
- ✅ **Task CRUD** – Add, edit, delete, mark complete
- ⚡ **Real-time sync** – Firestore `onSnapshot` keeps all devices in sync instantly
- 🏷️ **Categories** – Work, Personal, Study, Other
- 📅 **Due dates** – Overdue tasks highlighted in red
- 🔍 **Search & filter** – Filter by status and category, text search
- 🎮 **Gamification** – XP system (+10 XP per task), levels & badges
- 📊 **Dashboard** – Stats, productivity chart (last 7 days), XP progress
- 🌙 **Dark / Light theme** – Persisted in localStorage
- 📱 **Fully responsive** – Sidebar on desktop, bottom nav on mobile

---

## 🛠 Tech Stack

| Layer        | Technology                    |
|--------------|-------------------------------|
| Frontend     | React 19 + Vite               |
| Styling      | Tailwind CSS v4               |
| Backend/DB   | Firebase Firestore (NoSQL)    |
| Auth         | Firebase Authentication       |
| Real-time    | Firestore `onSnapshot`        |
| Charts       | Recharts                      |
| Icons        | Lucide React                  |
| Toasts       | React Hot Toast               |
| Hosting      | Vercel                        |
| Version Control | GitHub                     |

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase  

Copy the example env file and fill in your Firebase project values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> Get these values from: **Firebase Console → Project Settings → Your Apps → Web App → SDK setup**

### 4. Set Firestore Security Rules

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

### 5. Run locally

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## 🚢 Deploy to Vercel

1. Push repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add all `VITE_FIREBASE_*` environment variables in Vercel project settings
4. Click **Deploy** – Vercel auto-deploys on every push to `main`

---

## 📁 Project Structure

```
src/
├── firebase/
│   ├── config.js         # Firebase initialization
│   ├── taskService.js    # Firestore CRUD + onSnapshot
│   └── userService.js    # User profile + XP/levels
├── contexts/
│   ├── AuthContext.jsx   # Auth state & helpers
│   └── ThemeContext.jsx  # Dark/light theme
├── components/
│   ├── AppLayout.jsx     # App shell
│   ├── Sidebar.jsx       # Desktop nav
│   ├── BottomNav.jsx     # Mobile nav
│   ├── ProtectedRoute.jsx
│   ├── TaskCard.jsx      # Individual task render
│   └── TaskModal.jsx     # Add/edit task dialog
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   └── TasksPage.jsx
└── App.jsx               # Router + providers
```

---

## 👨‍💻 Author

Built for **Prog Web – Unidad 1 Project**.
