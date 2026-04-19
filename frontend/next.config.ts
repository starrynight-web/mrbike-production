import type { NextConfig } from "next";

/**
 * Detect if we're in build phase
 */
const isBuildPhase = process.argv.includes('build');

/**
 * Suppress warnings and errors that are benign or infrastructure-related
 * - DEP0169: Node.js deprecation warning from undici/url.parse in Next.js internal fetch
 * - NextAuth CLI errors during static generation
 */
// Suppress Node.js deprecation warnings (e.g. DEP0169)
if (process.env.NODE_ENV !== 'test') {
  // Suppress Node.js deprecation warnings
  process.env.NODE_NO_WARNINGS = '1';
  
  // Reduce Next.js verbosity during build
  process.noDeprecation = true;
  
  // Suppress process warnings
  if (process.emitWarning) {
    const originalEmitWarning = process.emitWarning;
    // @ts-ignore
    process.emitWarning = (warning: string | Error | any, ...args: any[]) => {
      if (typeof warning === 'object' && warning?.code === 'DEP0169') return;
      if (typeof warning === 'string' && warning.includes('DEP0169')) return;
      return originalEmitWarning.call(process, warning, ...args);
    };
  }
  
  // Try to suppress via stderr filtering (worker threads may still pass through)
  if (process.stderr && process.stderr.write) {
    const originalWrite: any = process.stderr.write;
    // @ts-ignore
    process.stderr.write = function(chunk: any, ...rest: any[]) {
      const str = Buffer.isBuffer(chunk) ? chunk.toString() : String(chunk);
      
      // Suppress benign build messages
      if (
        str.includes('[next-auth][error][CLIENT_FETCH_ERROR]') ||
        (str.includes('TypeError: fetch failed') && str.includes('ECONNREFUSED')) ||
        str.includes('DEP0169')
      ) {
        return true;
      }
      return originalWrite.call(this, chunk, ...rest);
    };
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: process.env.NODE_ENV === 'production', // Only run compiler in production for faster dev builds
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "hugeicons-react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "framer-motion",
      "date-fns",
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
        hostname: "*.onrender.com",
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
  // Ensure Cloudinary public IDs (non-URL strings) don't break image rendering
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/staff_admin',
        destination: '/admin',
      },
      {
        source: '/staff_admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
