import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 8081,
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "http://server:8080",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://server:8080",
        ws: true,
      },
    },
  },
});
