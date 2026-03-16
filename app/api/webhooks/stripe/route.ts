import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  try {
    // ИСПРАВЛЕНО: берем raw body для корректной проверки подписи Stripe
    const rawBody = Buffer.from(await request.arrayBuffer());
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadataOrderId = session.metadata?.orderId;

      if (metadataOrderId) {
        await prisma.order.update({
          where: { id: Number(metadataOrderId) },
          data: {
            status: 'PAID',
            stripePaymentId: session.id,
          },
        });
      } else {
        await prisma.order.updateMany({
          where: { stripePaymentId: session.id },
          data: { status: 'PAID' },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook signature verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
