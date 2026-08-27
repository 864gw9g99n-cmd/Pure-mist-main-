import { redirect } from 'next/navigation';

// Consolidated into the single admin hub at /admin/dashboard (Webinar tab).
export default function AdminWebinarRedirect() {
  redirect('/admin/dashboard');
}
