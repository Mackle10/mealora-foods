import { useEffect, useRef } from "react";
import { MapView } from "@/components/Map";
import { Bike, LocateFixed, MapPin } from "lucide-react";

type Tracking = { courierLat?: number; courierLng?: number; courierName?: string; courierSharing?: boolean; courierLocationUpdatedAt?: number | null; etaMinutes?: number; label?: string };

declare global { interface Window { google?: typeof google } }

export default function LiveTrackingMap({ tracking, address }: { tracking?: Tracking; address: string }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const addressMarkerRef = useRef<google.maps.Marker | null>(null);
  const routeRef = useRef<google.maps.Polyline | null>(null);
  const point = { lat: tracking?.courierLat ?? 0.3266, lng: tracking?.courierLng ?? 32.5825 };
  const addressPoint = { lat: point.lat - 0.012, lng: point.lng + 0.014 };
  useEffect(() => {
    if (!mapRef.current || !tracking?.courierLat || !tracking.courierLng) return;
    mapRef.current.panTo(point);
    if (!markerRef.current && window.google?.maps?.marker) markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({ map: mapRef.current, position: point, title: tracking.courierName ?? "Mealora courier" });
    else if (markerRef.current) markerRef.current.position = point;
    if (window.google?.maps) {
      if (!addressMarkerRef.current) addressMarkerRef.current = new window.google.maps.Marker({ map: mapRef.current, position: addressPoint, title: `Delivery address: ${address}`, label: "⌂" });
      else addressMarkerRef.current.setPosition(addressPoint);
      if (!routeRef.current) routeRef.current = new window.google.maps.Polyline({ map: mapRef.current, path: [point, addressPoint], geodesic: true, strokeColor: "#ff6945", strokeOpacity: 0.9, strokeWeight: 4 });
      else routeRef.current.setPath([point, addressPoint]);
    }
  }, [tracking?.courierLat, tracking?.courierLng]);
  return <div className="customer-live-map-wrap"><MapView className="customer-live-map" initialCenter={point} initialZoom={14} onMapReady={(map) => { mapRef.current = map; }} /><div className="customer-live-map-card"><span className={tracking?.courierSharing ? "live-location-badge active" : "live-location-badge"}><span className="live-dot" />{tracking?.courierSharing ? "LIVE LOCATION" : "LAST KNOWN LOCATION"}</span><strong><Bike size={15} />{tracking?.courierName ?? "Your courier"} · {tracking?.etaMinutes ?? 18} min away</strong><small><MapPin size={13} />Delivering to {address}</small><small>{tracking?.courierSharing && tracking.courierLocationUpdatedAt ? `Updated ${new Date(tracking.courierLocationUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "The courier's live location will appear when sharing begins."}</small></div><div className="customer-map-legend"><span className="route-key" />Route to your address <span className="address-key">⌂</span> Delivery address</div></div>;
}
