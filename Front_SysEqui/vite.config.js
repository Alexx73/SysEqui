import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from 'tailwindcss'; // Usamos import en vez de require
import autoprefixer from 'autoprefixer'; // También importamos autoprefixer

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss, // Usamos la importación directa
        autoprefixer, // También autoprefixer de esta forma
      ],
    },
  },
});
