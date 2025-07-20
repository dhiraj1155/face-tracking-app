# 🎯 Face Tracking App with Video Recording

A real-time face tracking and video recording application built using **Next.js**. Developed as part of a 24-hour coding challenge, this project combines live facial landmark detection with video capture, offering a seamless and responsive browser-based experience.

## 🚀 Live Demo

🔗 [View the Live App](https://face-tracking-app-chi.vercel.app/)

---

## 📝 Challenge Description

**Task:** Build a face tracking application using **Next.js** that:
- Tracks a user’s face in real-time
- Allows video recording while displaying tracking markers
- Saves recorded video locally
- Works seamlessly on desktop and mobile

---

## 🔧 Features

- ✅ Real-time face tracking with overlaid markers
- 🎥 Start/stop video recording
- 💾 Save recorded video using `localStorage`
- 📱 Fully responsive design
- ⚡ Fast, clean, and lightweight performance
- 🧠 Powered by open-source face tracking APIs

---

## 🛠️ Tech Stack

- **Framework:** Next.js (React)
- **Video Recording:** MediaRecorder API
- **Face Tracking:** face-api.js / MediaPipe / other open-source API
- **Styling:** Tailwind CSS / CSS Modules
- **Storage:** localStorage

---

## 📁 Project Structure

```
face-tracking-app/
├── components/       # Reusable components
├── pages/            # Next.js page routes
├── public/           # Static assets
├── styles/           # CSS/Tailwind files
├── utils/            # Helper functions
├── hooks/            # Custom React hooks
├── README.md
└── package.json
```

---

## 📦 Getting Started

### 📋 Prerequisites

- Node.js ≥ 16
- npm or yarn
- Modern browser with webcam support

### 🚀 Installation

```bash
git clone https://github.com/dhiraj1155/face-tracking-app.git
cd face-tracking-app
npm install
```

### ▶️ Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` to use the app locally.

### 🛠 Build for production

```bash
npm run build
npm run start
```

---

## 🧪 How It Works

1. User grants webcam access.
2. Face tracking markers appear in real time.
3. On clicking “Record,” the app starts recording using the `MediaRecorder` API.
4. The tracked video is saved in `localStorage` and can be previewed/downloaded.

---

## 🎯 Challenge Requirements Coverage

| Requirement                    | Status   |
|-------------------------------|----------|
| ✅ Face tracking API integrated | ✅ Done  |
| ✅ Video recording functionality | ✅ Done  |
| ✅ Tracking marker in video     | ✅ Done  |
| ✅ Local save via localStorage | ✅ Done  |
| ✅ Mobile responsiveness        | ✅ Done  |
| ✅ Next.js used as base        | ✅ Done  |

---

## 🧠 Future Improvements

- Export video as downloadable file
- Add emotion detection or pose estimation
- Add visual recording timer or progress bar
- Support cloud storage for videos

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🙌 Author

Built with ❤️ by Dhiraj Wagh
