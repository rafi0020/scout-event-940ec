import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports for better Netlify compatibility
  output: 'standalone',
  
  // Optimize for Netlify
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  
  // Image optimization
  images: {
    unoptimized: true
  },
  
  // Environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
};

export default nextConfig;
