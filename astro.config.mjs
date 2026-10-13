import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL || "https://horacioh.com",
  output: "static",
  trailingSlash: "never",
  build: { format: "directory" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  vite: { plugins: [tailwindcss()] },
});
