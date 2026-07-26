import path from "path";
import { fileURLToPath } from "url";

process.env.NO_PROXY = "127.0.0.1,localhost,::1";
process.env.no_proxy = "127.0.0.1,localhost,::1";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer', 'playwright-core', '@sparticuz/chromium-min', 'pdf-lib', 'fontkit'],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
