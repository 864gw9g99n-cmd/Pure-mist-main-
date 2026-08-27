// AdminHub (rendered from /admin/dashboard) manages its own full-page nav
// and layout, so this wrapper stays minimal — it also covers /admin/login,
// which needs no admin chrome at all.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
