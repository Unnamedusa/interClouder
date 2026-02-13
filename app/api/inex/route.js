import { NextResponse } from 'next/server';
import { runInex, validateInex } from '@/lib/inex';

export async function POST(request) {
  try {
    const { code, action = 'run' } = await request.json();
    if (!code || typeof code !== 'string') return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    if (code.length > 50000) return NextResponse.json({ error: 'Code too large' }, { status: 400 });
    const result = action === 'validate' ? validateInex(code) : runInex(code);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ success: false, errors: [{ message: e.message, type: 'server' }] }, { status: 500 });
  }
}
