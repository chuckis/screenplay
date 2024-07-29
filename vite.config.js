import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  // Makes HMR available for development
  base: '',
  build: {
    target: "esnext",
    minify: false,
    polyfill: false,
    assetsDir: 'assets',
     
  },
});
