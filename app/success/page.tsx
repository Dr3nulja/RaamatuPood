import Link from 'next/link';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id || 'N/A';

  let amountTotal = 0;
  let customerEmail = '';

  if (params.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      // ИСПРАВЛЕНО: получаем детали сессии по session_id после оплаты
      const session = await stripe.checkout.sessions.retrieve(params.session_id);
      amountTotal = (session.amount_total ?? 0) / 100;
      customerEmail = session.customer_details?.email || session.customer_email || '';
    } catch (error) {
      console.error('Failed to retrieve Stripe session:', error);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDF8F0] to-[#F5F0E8] flex items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-amber-100 bg-white px-8 py-12 text-center shadow-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-serif text-3xl font-bold text-[#8B5E3C]">Заказ оформлен!</h1>
          <p className="mt-3 text-zinc-700">Спасибо за покупку. Мы отправим вам уведомление по электронной почте о статусе доставки.</p>

          <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3">
            <p className="text-xs text-zinc-600">Session ID:</p>
            <p className="font-mono text-sm font-semibold text-[#8B5E3C] break-all">{sessionId}</p>
          </div>

          {amountTotal > 0 && (
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-left text-sm text-zinc-700">
              <p>
                <span className="font-semibold text-[#8B5E3C]">Сумма: </span>€{amountTotal.toFixed(2)}
              </p>
              {customerEmail && (
                <p className="mt-1">
                  <span className="font-semibold text-[#8B5E3C]">Email: </span>{customerEmail}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 space-y-2 text-sm text-zinc-700">
            <p>Вы сможете отследить доставку через письмо с трек-номером.</p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/catalog"
              className="rounded-xl bg-[#D97706] px-5 py-3 font-semibold text-white transition hover:bg-amber-500"
            >
              Перейти в каталог
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-[#A0785A] bg-white px-5 py-3 font-semibold text-[#8B5E3C] transition hover:bg-amber-50"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
