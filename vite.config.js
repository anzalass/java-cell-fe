import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Java Cell",
        short_name: "Java Cell",
        start_url: "/login?source=pwa",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1e40af",
        icons: [
          {
            src: "/vite.svg",
            sizes: "192x192",
            type: "image/svg",
          },
          {
            src: "/vite.svg",
            sizes: "512x512",
            type: "image/svg",
          },
        ],
      },
    }),
  ],
});
