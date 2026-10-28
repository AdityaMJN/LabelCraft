# 🎨 LabelCraft

**LabelCraft** is a professional, browser-based label and sticker designer built with **React + TypeScript + Three.js + Konva.js**.

A comprehensive solution for creating, editing, and visualizing custom labels with real-time 3D cylinder previews, featuring an intuitive 2D canvas editor with advanced text and image manipulation capabilities.

---

## 🚀 Features

### ✨ Core Features
- 🎯 **Interactive 2D Canvas Editor** - Drag, resize, and manipulate text, images, and shapes
- 🔄 **Real-time 3D Preview** - Live cylinder visualization with texture mapping
- 📝 **Advanced Text Editing** - Color, font, and size controls with professional typography
- 🖼️ **Image Manipulation** - Upload, resize, crop, invert, and stretch images
- 🗑️ **Right-click Deletion** - Easy removal of any canvas elements
- 📏 **Dynamic Dimensions** - Adjustable cylinder parameters with instant preview updates

### 🎨 Design Features
- 🌈 **Professional UI** - Modern gradient designs with glass morphism effects
- ✨ **Striking Animations** - Smooth hover effects and entrance animations
- 📱 **Responsive Design** - Optimized for desktop and tablet devices
- 🎭 **Visual Feedback** - Selected states, hover effects, and professional shadows

### 🛠️ Technical Features
- ⚡ **Fast Development** - Built with Vite for rapid iteration
- 🔒 **Type Safety** - Full TypeScript implementation
- 🎪 **3D Rendering** - Three.js with React Three Fiber
- 🖌️ **Canvas Manipulation** - Konva.js for 2D editing
- 🎨 **Professional Styling** - Fluent UI components with custom CSS

---

## 🧱 Tech Stack

| Layer | Technology | Purpose |
|--------|-------------|---------|
| **Frontend** | React + Vite + TypeScript | Modern web application framework |
| **3D Rendering** | Three.js + React Three Fiber | Real-time cylinder visualization |
| **2D Canvas** | Konva.js | Interactive label editing |
| **UI Components** | Fluent UI + Tailwind CSS | Professional component library |
| **Backend** | FastAPI (Python) | API services and data processing |
| **Database** | SQLModel + SQLite | Data persistence |
| **Geometry** | C++ (planned) | High-performance geometry calculations |

---

## 🧰 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for backend)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/labelcraft.git
   cd labelcraft
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Setup Backend** (Optional - for future features)
   ```bash
   cd ../backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

---

## 📁 Project Structure

```
LabelCraft/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── Components/       # Reusable UI components
│   │   │   ├── CylinderPreview.tsx  # 3D cylinder renderer
│   │   │   └── LabelEditor.tsx      # 2D canvas editor
│   │   ├── App.tsx           # Main application component
│   │   ├── App.css           # Professional styling
│   │   └── main.tsx          # Application entry point
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # FastAPI backend (Python)
│   ├── main.py              # API endpoints
│   ├── requirements.txt     # Python dependencies
│   └── app/                 # Application modules
└── cpp/                     # C++ geometry module (planned)
```

---

## 🎯 Usage

### Creating Labels
1. **Select Shape** - Choose from circle, rectangle, or custom shapes
2. **Set Dimensions** - Adjust radius, height, and other parameters
3. **Add Content** - Drag and drop text, images, or shapes onto the canvas
4. **Edit Properties** - Use the toolbar to modify colors, fonts, and sizes
5. **Preview** - See real-time updates on the 3D cylinder
6. **Export** - Save your design as an image or PDF

### Text Editing
- Click on text to edit content
- Use color picker for text color
- Select font family and size
- Position and resize as needed

### Image Editing
- Upload images via drag & drop
- Resize by dragging corners
- Right-click for additional options (invert, crop, etc.)
- Stretch and fit to canvas

---

## 🧠 Roadmap

### ✅ Completed Features
- [x] Interactive 2D canvas editor with Konva.js
- [x] Real-time 3D cylinder preview with Three.js
- [x] Text editing with color, font, and size controls
- [x] Image upload and manipulation (resize, crop, invert)
- [x] Right-click deletion for all elements
- [x] Professional UI with gradients and animations
- [x] Responsive design and visual feedback

### 🔄 In Progress
- [ ] Export functionality (PDF, PNG, SVG)
- [ ] Save/load designs
- [ ] Undo/redo functionality

### 🚀 Future Enhancements
- [ ] AI-powered design suggestions
- [ ] Template library
- [ ] Multi-language support
- [ ] Cloud storage integration
- [ ] Pro tier with advanced features
- [ ] Mobile app companion
- [ ] C++ geometry optimization

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork and clone
git clone https://github.com/yourusername/labelcraft.git

# Install dependencies
cd labelcraft/frontend
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

---

## 📄 License

MIT License © 2025 Aditya Ram Mangalampalli

Built with ❤️ using React, TypeScript, Three.js, and Konva.js

---

## 👨‍💻 Author

**Aditya Ram Mangalampalli**
- 💻 Full-stack developer passionate about 3D graphics and UI/UX
- 🎨 Creator of modern web applications
- 📧 [Contact](mailto:your.email@example.com)
- 🔗 [LinkedIn](https://linkedin.com/in/yourprofile)