import { prisma } from '@/lib/prisma';
import { requireUserFlowAccess } from '@/lib/auth/flow';
import ProfilePage from '../../components/account/ProfilePage';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { session, user: currentUser } = await requireUserFlowAccess({ returnTo: '/account' });

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      picture: true,
      name: true,
      orders: {
        include: {
          address: true,
          shippingMethod: true,
          orderItems: {
            include: {
              book: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  const orders = user?.orders || [];

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    totalPrice: Number(order.totalPrice ?? 0),
    status: order.status.toLowerCase() as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled',
    createdAt: order.createdAt.toISOString(),
    deliveryMethod: order.shippingMethod?.name || '—',
    address: order.address
      ? `${order.address.street || ''}, ${order.address.postalCode || ''} ${order.address.city || ''}, ${order.address.country || ''}`.replace(/\s+,/g, ',').replace(/\s+/g, ' ').trim()
      : '—',
    items: order.orderItems.map((item) => ({
      id: item.id,
      bookId: item.bookId,
      title: item.book?.title || 'Книга',
      quantity: item.quantity ?? 1,
      price: Number(item.price ?? 0),
    })),
  }));

  return (
    <ProfilePage
      name={user?.name || currentUser.name || session.user.nickname || 'User'}
      email={session.user.email || '—'}
      avatarUrl={user?.picture || session.user.picture || null}
      orders={formattedOrders}
    />
  );
}
