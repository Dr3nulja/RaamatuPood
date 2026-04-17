import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUserFlowAccess } from '@/lib/auth/flow';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export const dynamic = 'force-dynamic';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { user: currentUser } = await requireUserFlowAccess({ returnTo: '/admin' });

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
