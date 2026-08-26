import OrdersTable from '@/components/admin/OrdersTable';

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-gold-gradient">Orders</h1>
      <OrdersTable />
    </div>
  );
}
