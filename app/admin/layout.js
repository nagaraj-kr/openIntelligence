export const metadata = {
  title: 'Admin Panel — Open Intelligence Hub',
};

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* AdminNavbar is injected by ConditionalLayout — no duplicate header here */}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
