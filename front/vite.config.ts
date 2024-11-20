import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: '**/*.svg?react',
    }),
  ],
  resolve: {
    alias: {
      App: '/src/App',
      assets: '/src/assets',
      Features: '/src/Features',
      Pages: '/src/Pages',
      Shared: '/src/Shared',
      Widgets: '/src/Widgets',
      Styles: '/src/Styles',
    },
  },
});

//alias: {
// '/^umbrella_core/': path.join(__dirname, '/vendor/umbrella2/corebundle/assets/'),
// '/^umbrella_admin/': path.join(__dirname, '/vendor/umbrella2/adminbundle/assets/'),
//
// 'umbrella_core/': path.join(__dirname, '/vendor/umbrella2/corebundle/assets/'),
// 'umbrella_admin/': path.join(__dirname, '/vendor/umbrella2/adminbundle/assets/'),
