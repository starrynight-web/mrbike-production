import { getAppRoutes } from "@/lib/debug-utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic"; // Ensure we scan on every request

export default async function DebugRoutesPage() {
  // Security check: Only allow in development
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p>This debug tool is only available in development environment.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const routes = await getAppRoutes();

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Application Routes Debugger
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of all registered routes, their status, and configuration.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to App
            </Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/admin/debug">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-xs text-muted-foreground">
              {routes.filter((r) => r.type === "page").length} Pages,{" "}
              {routes.filter((r) => r.type === "route").length} API
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Implemented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {routes.filter((r) => r.status === "implemented").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Auth Protected (Est.)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {routes.filter((r) => r.authRequired).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {routes.filter((r) => r.type === "route").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Map</CardTitle>
          <CardDescription>
          List of all discovered pages in the application structure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Route Path</TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead className="text-right">Component Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.path}>
                  <TableCell>
                    {route.type === "route" ? (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200"
                      >
                        API
                      </Badge>
                    ) : (
                      <Badge variant="outline">Page</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">
                    <Link
                      href={route.path.includes("[") ? "#" : route.path}
                      className={
                        route.path.includes("[")
                          ? "cursor-not-allowed text-muted-foreground"
                          : "text-primary hover:underline"
                      }
                    >
                      {route.path}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {route.params.length > 0 ? (
                      <div className="flex gap-1">
                        {route.params.map((p) => (
                          <Badge
                            key={p}
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {p}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {route.status === "implemented" ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Implemented
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-200 bg-yellow-50"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" /> Partial
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {route.authRequired ? (
                      <Badge
                        variant="outline"
                        className="border-blue-200 text-blue-700 bg-blue-50"
                      >
                        <Shield className="w-3 h-3 mr-1" /> Required
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Public
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono">
                    {route.componentPath}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
  );
}
