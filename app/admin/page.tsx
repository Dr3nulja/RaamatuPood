import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth0.getSession();

  if (!session?.user?.sub) {
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminDashboard />;
}
