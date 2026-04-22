import { getDashboardUser } from '@/lib/dashboard';
import { Navbar } from '@/components/dashboard/Navbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDashboardUser();

  return (
    <div className="min-h-screen bg-bg">
      <Navbar user={user} />
      {children}
    </div>
  );
}
