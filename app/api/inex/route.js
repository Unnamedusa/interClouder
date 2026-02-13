import { NextResponse } from 'next/server';
import { runInex, validateInex } from '@/lib/inex';

export async function POST(request) {
  try {
    const { code, action = 'run' } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "code" field' }, { status: 400 });
    }

    if (code.length > 50000) {
      return NextResponse.json({ error: 'Code exceeds maximum length (50KB)' }, { status: 400 });
    }

    if (action === 'validate') {
      const result = validateInex(code);
      return NextResponse.json(result);
    }

    const result = runInex(code);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({
      success: false,
      errors: [{ message: e.message, type: 'server' }],
    }, { status: 500 });
  }
}
