import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { requireUserFlowAccess } from '@/lib/auth/flow';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { user: currentUser } = await requireUserFlowAccess({ returnTo: '/admin' });

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminDashboard />;
}
