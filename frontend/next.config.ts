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
    ],
  },
};

export default nextConfig;
