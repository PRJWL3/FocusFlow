# FocusFlow ⏳ — Aesthetic Pomodoro & Study Analytics Hub

<p align="center">
  <img src="./public/rain_scene_preview.jpg" alt="FocusFlow Live Rain Nature Scene" width="100%" style="border-radius: 12px; max-height: 400px; object-fit: cover;" />
</p>

<p align="center">
  <strong>Master your study sessions with intentional focus, soothing live nature atmospheres, and zero-drift time tracking.</strong>
</p>

<p align="center">
  <a href="https://github.com/PRJWL3/FocusFlow/actions"><img src="https://img.shields.io/badge/Status-Live%20Ready-success?style=for-the-badge&logo=githubactions&logoColor=white" alt="Deployment Status" /></a>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Web_Audio_API-Procedural-F59E0B?style=for-the-badge&logo=soundcharts&logoColor=white" alt="Web Audio API" />
</p>

---

## 🌟 Overview

**FocusFlow** is a modern, distraction-free Pomodoro study website designed for students, developers, and knowledge workers. Built with **React 18**, **Vite 6**, and **Tailwind CSS**, FocusFlow pairs deliberate time-boxing with calming live nature wallpapers, authentic audio soundscapes, and comprehensive daily study metrics.

---

## ✨ Key Features

### 1. ⏱️ Precision Dual Timers & Anti-Reset Synchronization
- **Pomodoro Countdown & Total Elapsed Stopwatch**: Run your focus cycle side-by-side with a dedicated **Total Time Elapsed** tracker so you always know your exact cumulative study time for the day.
- **Popular Study Presets**: Switch in one click between `25/5` (Standard), `50/10` (Deep Work), `60/10` (Heavy Focus), and `90/20` (Ultradian Rhythm).
- **Zero-Drift Background Catch-Up**: Uses high-precision `Date.now()` timestamp deltas and `visibilitychange` listeners. **The timer never stalls, drifts, or restarts** when you switch between in-app tabs (like Analytics) or background browser windows.
- **Visual Progress Ring**: Smooth SVG circular countdown animation with dynamic browser tab title integration (`(24:18) - Focus | FocusFlow`).

### 2. 🪟 Always-on-Top Floating Picture-in-Picture (PiP) Window
- Pop open an always-on-top floating mini-timer powered by the browser's **Document Picture-in-Picture API**.
- View **both** the remaining Pomodoro countdown and the total elapsed time stopwatch over your IDE, PDF textbook, or research browser window.
- Interactive controls inside the pop-up window: Play/Pause, Skip, and mode indicators.

### 3. 🌧️ Authentic Live Nature Wallpaper & Dynamic Audio
- **HD Live Stream Scene**: Features a soothing HD nature rain scene with misty evergreens and gentle raindrops.
- **Dynamic Sound-to-Wallpaper Syncing**: Changing ambient music automatically adapts the visual scene:
  - **Authentic Rain & Thunder**: High-fidelity stereo recording paired with the live video loop.
  - **Forest Stream**: Procedural babbling brook with water ripple canvas animations.
  - **Mountain Mist (Brown Noise)**: Deep warm rumble paired with dusk mountain ridges.
  - **Lush Forest (White Noise)**: Calming breeze masking background distractions with glowing sunbeams.
  - **Glowing Fireflies**: Enchanting twilight forest with floating fireflies.

### 4. 📊 Daily Study & Session Analytics
- **Live Daily Focus Counter**: Real-time counter of total hours and minutes completed today.
- **Daily Target Progress Bar**: Track percentage completed towards your daily goal (e.g., 4 or 6 hours/day).
- **7-Day Visual Study Chart**: Interactive bar chart comparing daily study output across the week.
- **Subject Distribution**: Color-coded breakdown of study time spent per subject.
- **Chronological Session History**: Review logged sessions with exact timestamps, subject tags, and durations.

### 5. 🏷️ Subject & Task Focus
- **Custom Subjects**: Tag sessions with subjects (Computer Science, Mathematics, Research, Deep Work) or create custom subjects with personalized color palettes.
- **Session Focus Tasks**: Clean checklist to break down actionable goals for each study block.

### 6. 🎨 Aesthetic Themes & Zen Audio
- Four curated themes: **Cosmic Dark** (default), **Cozy Lofi Amber**, **Matcha Forest**, and **Cyberpunk Neon**.
- Procedural Tibetan singing bowl and marimba chimes generated via the **Web Audio API** — 100% offline, zero broken audio links.
- Celebration confetti on session completions.
- Desktop notifications when focus sessions or breaks end.

### 7. 🔒 100% Private & Offline-First
- All sessions, settings, subjects, tasks, and elapsed time persist in browser `localStorage`.
- No account registration, no telemetry, and zero backend tracking.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Local Installation
```bash
# Clone the repository
git clone https://github.com/PRJWL3/FocusFlow.git

# Navigate into the project directory
cd FocusFlow

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

---

## 🌐 Deployment to GitHub Pages

This repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys FocusFlow to **GitHub Pages** whenever changes are pushed to `main`.

To enable GitHub Pages manually:
1. Go to your repository **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions** (or deploy from the `gh-pages` branch).
3. The live website will be published at:  
   `https://PRJWL3.github.io/FocusFlow/`

---

## 🛠️ Tech Stack

- **Framework**: React 18 with React Hooks
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS, PostCSS, Lucide React Icons
- **Audio & Animations**: Web Audio API Synthesizer, HTML5 Media, Canvas Confetti
- **APIs**: Document Picture-in-Picture API, Web Notifications API, Page Visibility API

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
