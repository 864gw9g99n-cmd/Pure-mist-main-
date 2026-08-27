import { redirect } from 'next/navigation';

// Consolidated into the single admin hub at /admin/dashboard (Products tab).
// This route stays only so old bookmarks/links still land somewhere useful.
export default function AdminProductsRedirect() {
  redirect('/admin/dashboard');
}
