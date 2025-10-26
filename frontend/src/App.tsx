import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-indigo-600 mb-4">
        LabelCraft 🎨
      </h1>
      <p className="text-gray-600">
        Tailwind CSS is working perfectly ✅
      </p>
    </div>
  );
}

export default App
