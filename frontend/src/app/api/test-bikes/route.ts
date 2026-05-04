import { NextResponse } from 'next/server';
import { api } from '@/lib/api-service';

export async function GET() {
  try {
    const res = await api.getBikes({ limit: 2 });
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack, config: e.config, responseData: e.response?.data });
  }
}
