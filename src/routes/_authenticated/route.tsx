import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getAdminSession } from '@/lib/admin-auth.functions';
export const Route = createFileRoute('/_authenticated')({ ssr: false, beforeLoad: async () => {
  const { authenticated } = await getAdminSession();
  if (!authenticated) throw redirect({ to: '/auth' });
}, component: () => <Outlet /> });
