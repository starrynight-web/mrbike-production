import type { NextConfig } from "next";

// Suppress specific Node.js deprecation warnings (DEP0169 for url.parse)
if (typeof process !== "undefined" && process.emitWarning) {
  const originalEmitWarning = process.emitWarning;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Override internal method
  process.emitWarning = (...args: unknown[]) => {
    const warning = args[0];
    if (
      (typeof warning === "string" && warning.includes("DEP0169")) ||
      (typeof warning === "object" &&
        warning &&
        (warning as { code?: string }).code === "DEP0169")
    ) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return originalEmitWarning.apply(process, args as any);
  };
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
};

export default nextConfig;
