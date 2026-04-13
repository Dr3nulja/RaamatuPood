'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createCheckout } from '@/lib/checkout/createCheckout';
import { requireUserFlowAccess } from '@/lib/auth/flow';

export async function createCheckoutSession(formData: FormData) {
  let redirectTo = '/checkout?error=checkout_failed';

  try {
    const { session } = await requireUserFlowAccess({ returnTo: '/checkout' });
    const authUser = session?.user;

    if (!authUser?.sub) {
      redirectTo = '/checkout?error=unauthorized';
      return;
    }

    const guestName = String(formData.get('name') || '').trim();
    const guestEmail = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const deliveryMethod = String(formData.get('delivery') || '').trim();

    const checkout = await createCheckout({
      auth0Id: authUser.sub,
      fallbackEmail: authUser.email,
      guestName,
      guestEmail,
      phone,
      deliveryMethod,
      address: String(formData.get('address') || ''),
      street: String(formData.get('street') || ''),
      postalCode: String(formData.get('postalCode') || ''),
      city: String(formData.get('city') || ''),
      country: String(formData.get('country') || ''),
    });

    if (!checkout.ok) {
      redirectTo = `/checkout?error=${checkout.code}`;
      return;
    }

    revalidatePath('/account');
    redirectTo = checkout.checkoutUrl;
  } catch (error) {
    console.error('createCheckoutSession failed:', error);
  }

  redirect(redirectTo);
}