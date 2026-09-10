import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bike, Check, Clock3, MapPin, PackageCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const statuses = ["confirmed", "preparing", "picked_up", "on_the_way", "delivered"] as const;

export default function CourierDashboard() {
  const { user } = useAuth();
  const orders = trpc.courier.orders.useQuery(undefined, { enabled: user?.role === "courier" || user?.role === "admin", refetchInterval: 5000 });
  const updateStatus = trpc.courier.updateStatus.useMutation({ onSuccess: async () => { await orders.refetch(); toast.success("Order status updated", { description: "The customer tracking view and SMS workflow are now in sync." }); }, onError: (error) => toast.error("Could not update status", { description: error.message }) });
  const active = useMemo(() => orders.data ?? [], [orders.data]);

  if (!user || (user.role !== "courier" && user.role !== "admin")) return <DashboardLayout><div className="courier-denied"><ShieldAlert size={28} /><h1>Courier workspace</h1><p>This space is reserved for approved couriers and Mealora operations admins.</p><a href="/partners">Apply to join the network</a></div></DashboardLayout>;

  return <DashboardLayout><div className="courier-page"><div className="courier-hero"><div><span className="dashboard-kicker">MEALORA OPERATIONS</span><h1>Keep every order moving.</h1><p>Update status from pickup to doorstep. Customers see the change instantly, and eligible SMS alerts are sent automatically.</p></div><div className="courier-live"><span className="live-dot" />LIVE QUEUE<strong>{active.length}</strong></div></div><div className="courier-metrics"><div><Clock3 size={18} /><span>Active drops</span><strong>{active.length}</strong></div><div><Bike size={18} /><span>On the road</span><strong>{active.filter((order) => ["picked_up", "on_the_way"].includes(order.status)).length}</strong></div><div><PackageCheck size={18} /><span>Ready to close</span><strong>{active.filter((order) => order.status === "on_the_way").length}</strong></div></div><section className="courier-list"><div className="courier-list-head"><div><span className="dashboard-kicker">ACTIVE DELIVERY BOARD</span><h2>Today’s route</h2></div><span className="courier-refresh"><span className="status-pip" />Updates every 5 seconds</span></div>{orders.isLoading ? <div className="loading-line"><span /><span /><span /></div> : active.length ? active.map((order) => <article className="courier-order" key={order.id}><div className="courier-order-id"><strong>{order.orderNumber}</strong><span><MapPin size={13} />{order.deliveryAddress}</span></div><div className="courier-order-meta"><span>UGX {order.totalCents.toLocaleString()}</span><small>{order.paymentStatus === "initiated" ? "Payment pending" : order.paymentStatus}</small></div><div className="courier-actions"><select value={order.status} disabled={updateStatus.isPending} onChange={(event) => updateStatus.mutate({ orderId: order.id, status: event.target.value as typeof statuses[number] })}>{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select>{order.paymentStatus === "initiated" && <button onClick={() => updateStatus.mutate({ orderId: order.id, paymentStatus: "paid" })}><Check size={14} />Mark paid</button>}</div></article>) : <div className="courier-empty"><PackageCheck size={26} /><h3>No active drops</h3><p>New orders will appear here as soon as they are placed.</p></div>}</section></div></DashboardLayout>;
}
