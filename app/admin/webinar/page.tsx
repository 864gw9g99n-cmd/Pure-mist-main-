import WebinarTable from '@/components/admin/WebinarTable';

export default function AdminWebinarPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-gold-gradient">Webinar Registrations</h1>
      <WebinarTable />
    </div>
  );
}
