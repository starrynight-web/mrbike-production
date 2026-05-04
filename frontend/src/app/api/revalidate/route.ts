import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-Demand Revalidation API
 * Usage: POST /api/revalidate?secret=TOKEN&path=/bike/honda-cb
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const path = request.nextUrl.searchParams.get("path");

  // Security Check
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ message: "Path is required" }, { status: 400 });
  }

  try {
    // Revalidate the specific path
    // We use "page" type to ensure the full rendered HTML is purged
    revalidatePath(path, "page");
    
    console.log(`[ISR] Successfully revalidated: ${path}`);
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      path: path 
    });
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
