import fs from 'fs';
import path from 'path';

export interface RouteInfo {
  path: string;
  componentPath: string;
  status: 'implemented' | 'partial' | 'missing';
  params: string[];
  authRequired: boolean;
  type: 'page' | 'layout' | 'route';
}

const APP_DIR = path.join(process.cwd(), 'src', 'app');

export async function getAppRoutes(): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = [];

  try {
    if (!fs.existsSync(APP_DIR)) {
      return routes;
    }
    await scanDirectory(APP_DIR, '', routes);
  } catch (error) {
    console.error('Error scanning routes:', error);
  }

  return routes.sort((a, b) => a.path.localeCompare(b.path));
}

async function scanDirectory(currentPath: string, routePrefix: string, routes: RouteInfo[]) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const dirName = entry.name;
      
      // Skip special Next.js folders or private folders unless they contribute to route structure
      if (dirName.startsWith('.') || dirName.startsWith('_')) {
        continue;
      }

      // Handle Route Groups (e.g., (auth)) - they don't affect the URL path
      let nextPrefix = routePrefix;
      if (!dirName.startsWith('(')) {
        nextPrefix = `${routePrefix}/${dirName}`;
      }

      await scanDirectory(path.join(currentPath, dirName), nextPrefix, routes);
    } else if (entry.isFile()) {
      const fileName = entry.name;
      const isPage = fileName.startsWith('page.');
      const isRoute = fileName.startsWith('route.');
      
      if ((isPage || isRoute) && (fileName.endsWith('.tsx') || fileName.endsWith('.ts') || fileName.endsWith('.js') || fileName.endsWith('.jsx'))) {
        // Found a page or route
        const fullPath = path.join(currentPath, fileName);
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        
        const params = extractParams(routePrefix);
        const authRequired = checkAuthRequirement(fileContent);
        
        // Determine status based on file size/content
        // Heuristic: If file is very small (< 200 chars), might be a stub/partial
        const status = fileContent.length < 200 ? 'partial' : 'implemented';

        routes.push({
          path: routePrefix === '' ? '/' : routePrefix,
          componentPath: path.relative(process.cwd(), fullPath),
          status,
          params,
          authRequired,
          type: isRoute ? 'route' : 'page'
        });
      }
    }
  }
}

function extractParams(routePath: string): string[] {
  const matches = routePath.match(/\[.*?\]/g);
  if (!matches) return [];
  return matches.map(p => p.replace(/[\[\]]/g, ''));
}

function checkAuthRequirement(content: string): boolean {
  // Heuristics for auth requirement
  return (
    content.includes('useAuth') || 
    content.includes('getServerSession') || 
    content.includes('redirect("/login")') ||
    content.includes("redirect('/login')") ||
    content.includes('middleware') ||
    content.includes('adminAPI') // Admin pages usually require auth
  );
}
