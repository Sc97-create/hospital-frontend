import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    ],
    server:{
      allowedHosts:['23b1a5a84a65.ngrok-free.app'],
    }
})
