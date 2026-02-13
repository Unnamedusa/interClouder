import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ status: 'ok', version: '6.5.0', platform: 'interClouder', language: 'intercoder bridge' });
}
