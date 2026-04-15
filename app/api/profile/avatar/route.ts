import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

function parseDataUrl(value: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(value);
  if (!match) {
    return null;
  }

  return {
    contentType: match[1],
    base64Payload: match[2],
  };
}

export async function GET() {
  const session = await auth0.getSession();
  const auth0Id = session?.user?.sub;

  if (!auth0Id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id },
    select: { picture: true },
  });

  if (!user?.picture) {
    return NextResponse.json({ error: 'avatar_not_found' }, { status: 404 });
  }

  const parsed = parseDataUrl(user.picture);
  if (!parsed) {
    return NextResponse.redirect(user.picture);
  }

  const avatarBuffer = Buffer.from(parsed.base64Payload, 'base64');

  return new NextResponse(avatarBuffer, {
    status: 200,
    headers: {
      'Content-Type': parsed.contentType,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
