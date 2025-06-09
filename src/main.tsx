import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './index.css'

// Using default system fonts for the Zaplytics app

createRoot(document.getElementById("root")!).render(<App />);
