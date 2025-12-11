# 📦 PackFlow - Smart Load Calculator

[![Go to App](https://img.shields.io/badge/🚀_Go_to_App-Click_Here-2dd4bf?style=for-the-badge&logo=rocket&logoColor=white)](https://isabosdev.com/PackFlow/)

[![English](https://img.shields.io/badge/English-blue?style=flat-square)](README.md) [![Spanish](https://img.shields.io/badge/Español-red?style=flat-square)](README_ES.md)

> **Optimize your shipping logistics in seconds with 3D visualization.**



**PackFlow** is a powerful yet lightweight web application designed to solve the complex "Bin Packing Problem" for logistics professionals. It automatically calculates the best container configuration for your cargo, visualizing the result in an interactive 3D environment.

It supports standard containers (20', 40', HC) as well as special equipment like **Open Tops** and **Flat Racks**.

---

## 🚀 Key Features

*   **🧠 Intelligent Algorithm:** Automatically sorts items based on size, stackability, and volume constraints.
*   **🚚 Multi-Container Support:** From standard Dry Vans to Flat Racks and Open Tops.
*   **🧊 Interactive 3D Viewer:** Inspect your load from every angle using Three.js technology.
*   **⚡ Instant Feedback:** Real-time calculation of weight limits, volume usage, and stability (Center of Gravity).
*   **📊 Smart Import:** Copy and paste your packing list directly from Excel.
*   **📑 Professional Reports:** Export a detailed CSV manifest of your optimized load plan.

## 🛠️ Technology Stack

Built with a modern, performance-first stack:
*   **React 18** - Determines the UI logic.
*   **Vite** - Lightning fast build tool.
*   **Three.js** - Physics-accurate 3D rendering.
*   **TailwindCSS** - Beautiful, responsive styling.

## 🏁 Getting Started

### Prerequisites
You need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1.  Clone this repository:
    ```bash
    git clone https://github.com/yourusername/packflow.git
    cd packflow
    ```

2.  Install dependencies (using pnpm is recommended):
    ```bash
    pnpm install
    ```

3.  Start the development server:
    ```bash
    pnpm dev
    ```

4.  Open `http://localhost:5173` in your browser.


![PackFlow Preview](public/screenshots/preview.png)

## Project Structure
```bash
src/
├── components/
│   ├── common/           # Generic UI components (Icons, Modals, Toasts)
│   ├── layout/           # Layout components (Header)
│   ├── packing/          # Step 1: Input & Configuration components
│   ├── results/          # Step 2: Visualization & Metrics components
│   └── Visualizer3D.jsx  # Core Three.js visualization logic
├── data/
│   └── containers.js     # Standard container definitions (ISO, FR, OT)
├── utils/
│   └── packingAlgorithm.js # Core packing logic (First Fit Decreasing)
├── App.jsx               # Main state manager & View controller
└── main.jsx              # Entry point
```

## License

Private - Created by [isabosdev](https://github.com/isa-bos-dev).