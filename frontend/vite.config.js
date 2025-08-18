import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],

    server: {
        proxy: {
            "/api": {
                target: "http://localhost:5001",
                changeOrigin: true,
                secure: false,
            },
        },
    },

    // Add this to resolve module issues
    resolve: {
        alias: {
            "@": "/src",
        },
    },

    // Optimize dependencies to prevent module resolution issues
    optimizeDeps: {
        include: ["@stripe/stripe-js"],
        exclude: [], // Ensure nothing is excluded that shouldn't be
    },

    // Build configuration to handle module loading
    build: {
        target: "es2015",
        rollupOptions: {
            external: [],
            output: {
                manualChunks: {
                    stripe: ["@stripe/stripe-js"],
                },
            },
        },
    },

    // Define to prevent issues with missing modules
    define: {
        global: "globalThis",
    },
});
