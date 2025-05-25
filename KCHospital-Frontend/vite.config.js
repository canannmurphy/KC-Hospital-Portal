import { defineConfig } from "vite";
import os from "node:os";
import path from "node:path";
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";

function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const localIP = getLocalNetworkIP();

export default defineConfig({
  base: "./",
  server: {
    host: localIP,
    port: 3000,
    open: true,
    proxy: {
      "/log-visit": {
        target: `http://${localIP}:4000`,
        changeOrigin: true,
        secure: false,
      },
      "/get-ip": {
        target: `http://${localIP}:4000`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve("./index.html"),
      },
      plugins: [
        obfuscatorPlugin({
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
        }),
      ],
    },
  },
});
