import { defineConfig } from "vite";

export default defineConfig({
    root: "src",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        rollupOptions: {
            input: "src/index.html"
        }
    },
    publicDir: "../public",
    server: {
        port: 1234,
        open: true
    }
});
