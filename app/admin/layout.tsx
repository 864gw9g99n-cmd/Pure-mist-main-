import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen-safe bg-midnight">
      <AdminNav />
      <div className="pt-16 sm:pl-56 safe-bottom">
        <div className="p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
