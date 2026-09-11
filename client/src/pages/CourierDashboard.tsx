import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bike, Check, Clock3, LocateFixed, MapPin, PackageCheck, ShieldAlert, Square } from "lucide-react";
import { toast } from "sonner";

const statuses = ["confirmed", "preparing", "picked_up", "on_the_way", "delivered"] as const;

type Point = { lat: number; lng: number };

declare global { interface Window { google?: typeof google } }

export default function CourierDashboard() {
  const { user } = useAuth();
  const orders = trpc.courier.orders.useQuery(undefined, { enabled: user?.role === "courier" || user?.role === "admin", refetchInterval: 5000 });
  const updateStatus = trpc.courier.updateStatus.useMutation({ onSuccess: async () => { await orders.refetch(); toast.success("Order status updated", { description: "The customer tracking view and SMS workflow are now in sync." }); }, onError: (error) => toast.error("Could not update status", { description: error.message }) });
  const updateLocation = trpc.courier.updateLocation.useMutation({ onError: (error) => toast.error("Location sharing paused", { description: error.message }) });
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [courierPosition, setCourierPosition] = useState<Point | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const watchRef = useRef<number | null>(null);
  const active = useMemo(() => orders.data ?? [], [orders.data]);
  const selectedOrder = active.find((order) => order.id === selectedOrderId) ?? active[0];

  useEffect(() => { if (!selectedOrderId && active[0]) setSelectedOrderId(active[0].id); }, [active, selectedOrderId]);
  useEffect(() => () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); }, []);
  useEffect(() => {
    if (!mapRef.current || !selectedOrder) return;
    const point = courierPosition ?? { lat: (selectedOrder.courierLatE6 ?? 326600) / 1e6, lng: (selectedOrder.courierLngE6 ?? 32582500) / 1e6 };
    mapRef.current.panTo(point);
    if (!markerRef.current && window.google?.maps?.marker) markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({ map: mapRef.current, position: point, title: "Mealora courier" });
    else if (markerRef.current) markerRef.current.position = point;
  }, [courierPosition, selectedOrder]);

  const stopSharing = () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; setSharing(false); if (selectedOrder) updateLocation.mutate({ orderId: selectedOrder.id, lat: courierPosition?.lat ?? (selectedOrder.courierLatE6 ?? 326600) / 1e6, lng: courierPosition?.lng ?? (selectedOrder.courierLngE6 ?? 32582500) / 1e6, sharing: false }); };
  const startSharing = () => {
    if (!selectedOrder) { toast("Select an active delivery first"); return; }
    if (!navigator.geolocation) { toast.error("Location sharing is unavailable in this browser"); return; }
    setSharing(true);
    watchRef.current = navigator.geolocation.watchPosition((position) => { const point = { lat: position.coords.latitude, lng: position.coords.longitude }; setCourierPosition(point); updateLocation.mutate({ orderId: selectedOrder.id, ...point, sharing: true }); }, () => { setSharing(false); toast.error("Location permission is required", { description: "Allow location access to share your live position with the customer." }); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
  };

  if (!user || (user.role !== "courier" && user.role !== "admin")) return <DashboardLayout><div className="courier-denied"><ShieldAlert size={28} /><h1>Courier workspace</h1><p>This space is reserved for approved couriers and Mealora operations admins.</p><a href="/partners">Apply to join the network</a></div></DashboardLayout>;

  return <DashboardLayout><div className="courier-page"><div className="courier-hero"><div><span className="dashboard-kicker">MEALORA OPERATIONS</span><h1>Keep every order moving.</h1><p>Update status from pickup to doorstep. Customers see the change instantly, and eligible SMS alerts are sent automatically.</p></div><div className="courier-live"><span className="live-dot" />LIVE QUEUE<strong>{active.length}</strong></div></div><div className="courier-metrics"><div><Clock3 size={18} /><span>Active drops</span><strong>{active.length}</strong></div><div><Bike size={18} /><span>On the road</span><strong>{active.filter((order) => ["picked_up", "on_the_way"].includes(order.status)).length}</strong></div><div><PackageCheck size={18} /><span>Ready to close</span><strong>{active.filter((order) => order.status === "on_the_way").length}</strong></div></div><section className="courier-map-card"><div className="courier-list-head"><div><span className="dashboard-kicker">LIVE LOCATION SHARING</span><h2>{selectedOrder ? `Delivery ${selectedOrder.orderNumber}` : "Choose a delivery"}</h2></div><div className="courier-map-controls"><button onClick={sharing ? stopSharing : startSharing}>{sharing ? <><Square size={14} />Stop sharing</> : <><LocateFixed size={14} />Share my location</>}</button></div></div><div className="courier-map-wrap"><MapView className="courier-map" initialCenter={{ lat: selectedOrder ? (selectedOrder.courierLatE6 ?? 326600) / 1e6 : 0.3266, lng: selectedOrder ? (selectedOrder.courierLngE6 ?? 32582500) / 1e6 : 32.5825 }} initialZoom={14} onMapReady={(map) => { mapRef.current = map; }} /><div className="courier-map-status"><span className={sharing ? "status-pip sharing" : "status-pip"} />{sharing ? "Your live position is being shared" : "Location sharing is off"}<small>{selectedOrder?.deliveryAddress ?? "Select an order below"}</small></div></div></section><section className="courier-list"><div className="courier-list-head"><div><span className="dashboard-kicker">ACTIVE DELIVERY BOARD</span><h2>Today’s route</h2></div><span className="courier-refresh"><span className="status-pip" />Updates every 5 seconds</span></div>{orders.isLoading ? <div className="loading-line"><span /><span /><span /></div> : active.length ? active.map((order) => <article className={`courier-order ${selectedOrder?.id === order.id ? "selected" : ""}`} key={order.id} onClick={() => setSelectedOrderId(order.id)}><div className="courier-order-id"><strong>{order.orderNumber}</strong><span><MapPin size={13} />{order.deliveryAddress}</span></div><div className="courier-order-meta"><span>UGX {order.totalCents.toLocaleString()}</span><small>{order.paymentStatus === "initiated" ? "Payment pending" : order.paymentStatus}</small></div><div className="courier-actions"><select value={order.status} disabled={updateStatus.isPending} onChange={(event) => updateStatus.mutate({ orderId: order.id, status: event.target.value as typeof statuses[number] })}>{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select>{order.paymentStatus === "initiated" && <button onClick={(event) => { event.stopPropagation(); updateStatus.mutate({ orderId: order.id, paymentStatus: "paid" }); }}><Check size={14} />Mark paid</button>}</div></article>) : <div className="courier-empty"><PackageCheck size={26} /><h3>No active drops</h3><p>New orders will appear here as soon as they are placed.</p></div>}</section></div></DashboardLayout>;
}
