/**
 * Next.js Instrumentation Hook
 * This file runs in every process (main, server, and build workers).
 * We use it to globally intercept authentication fetches during the build process
 * to prevent ECONNREFUSED errors on port 3000.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only patch during the build phase to avoid side effects in development or production run
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.argv.includes('build')) {
      const originalFetch = global.fetch;
      
      // @ts-ignore - Patching global fetch to prevent build-time network errors
      global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
        
        // Intercept NextAuth session checks
        if (url.includes('/api/auth/session')) {
          return new Response(JSON.stringify(null), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        return originalFetch(input, init);
      };
      
      console.log('--- [BUILD-STABILITY] Fetch interceptor active ---');
    }
  }
}
