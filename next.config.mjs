/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    "localhost",
    "192.168.1.7",
    "*.ngrok-free.app",   // ngrok free tier domain
    "*.ngrok.io",
  ]
};

export default nextConfig;
