
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    fs: {
      strict: true, // Best practice for security and performance
    },
    hmr: {
      port: 8080,
    },
  },
  preview: {
    port: 8080,
    host: "localhost",
  },
  plugins: [
    react(),
    tailwindcss(),
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
