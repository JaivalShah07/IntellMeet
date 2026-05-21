import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const reactPath = path.join(dir, "node_modules/react");
const reactDomPath = path.join(dir, "node_modules/react-dom");

export default defineConfig({
  root: path.join(dir, "frontend"),
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom"],
    alias: {
      react: reactPath,
      "react-dom": reactDomPath,
    },
  },
  server: {
    fs: {
      allow: [dir],
    },
  },
});
