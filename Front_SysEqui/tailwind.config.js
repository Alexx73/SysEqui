import flowbite from 'flowbite-react/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    flowbite.content(), // Agregar el contenido de Flowbite
  ],
  theme: {
    extend: {},
  },
  plugins: [
    flowbite.plugin(), // Agregar Flowbite como plugin
  ],
};
