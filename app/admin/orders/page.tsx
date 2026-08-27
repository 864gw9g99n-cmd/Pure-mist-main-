import { redirect } from 'next/navigation';

// Consolidated into the single admin hub at /admin/dashboard (Orders tab).
export default function AdminOrdersRedirect() {
  redirect('/admin/dashboard');
}
