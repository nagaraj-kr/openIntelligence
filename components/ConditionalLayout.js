'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdmin      = pathname?.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';

  if (isAdmin) {
    return (
      <>
        {/* Admin login page and Admin dashboard have their own layouts — no shared AdminNavbar */}
        <main>{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
