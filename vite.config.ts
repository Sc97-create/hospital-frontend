import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    ],
    server:{
      allowedHosts: [
        '23b1a5a84a65.ngrok-free.app',
        '998894f6516c.ngrok-free.app',
        '0fd9-2409-40f2-11a2-b4dc-acd1-d585-c3e3-4c4d.ngrok-free.app',
        'f042-2409-40f2-11a2-b4dc-acd1-d585-c3e3-4c4d.ngrok-free.app',
      ],
    }
})
