import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  void request;
  // ИСПРАВЛЕНО: checkout теперь обрабатывается через Server Action `createCheckoutSession`
  return NextResponse.json(
    { error: 'Use Server Action createCheckoutSession instead of /api/checkout' },
    { status: 410 }
  );
}
