
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      strict: true, // Best practice for security and performance
    },
  },
  preview: {
    port: 8080,
    host: "::",
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          // Add other large libraries here for better caching
        },
      },
    },
  },
  define: {
    global: 'globalThis', // Necessary polyfill for browser environments
    // 'process.env': {}, // REMOVED: Vite handles process.env.NODE_ENV by default.
                         // This line was breaking access to process.env.NODE_ENV in client code.
  },
}));
