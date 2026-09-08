import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import { toast } from "sonner";
import { ArrowRight, Bike, Check, ChevronDown, Globe2, Heart, MapPin, Menu, PackageCheck, Plus, Search, ShoppingBag, Sparkles, Star, Store, Utensils, X, Zap } from "lucide-react";
import { fallbackCities, fallbackRestaurants, type MenuItem, type Restaurant } from "@shared/catalog";

const imageRoot = "/manus-storage/";
const cuisines = ["All cuisines", "African", "Asian", "European", "Latin American", "Wellness"];

function formatMoney(cents: number, currency = "UGX") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useState("Kampala, Uganda");
  const [query, setQuery] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All cuisines");
  const [menuRestaurant, setMenuRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number }>>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [trackingPulse, setTrackingPulse] = useState(0);
  const [city, setCity] = useState("");

  const citiesQuery = trpc.marketplace.cities.useQuery();
  const restaurantsQuery = trpc.marketplace.restaurants.useQuery({ citySlug: city || undefined, cuisine: activeCuisine === "All cuisines" ? undefined : activeCuisine, query: query || undefined });
  const menuQuery = trpc.marketplace.menu.useQuery({ restaurantId: menuRestaurant?.id ?? 0 }, { enabled: Boolean(menuRestaurant) });
  const aiSuggest = trpc.ai.suggest.useMutation();
  const toggleFavorite = trpc.favorites.toggle.useMutation();
  const tracking = trpc.orders.track.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 5000, refetchOnWindowFocus: false });
  const createOrder = trpc.orders.create.useMutation();

  const cities = (citiesQuery.data?.length ? citiesQuery.data : fallbackCities);
  const restaurants = (restaurantsQuery.data?.length ? restaurantsQuery.data : fallbackRestaurants);
  const menu = menuQuery.data ?? [];
  const cartTotal = cart.reduce((sum, entry) => sum + entry.item.priceCents * entry.quantity, 0);
  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const trackingStatus = tracking.data;

  useEffect(() => {
    const timer = window.setInterval(() => setTrackingPulse((value) => (value + 1) % 4), 3800);
    return () => window.clearInterval(timer);
  }, []);

  const shownRestaurants = useMemo(() => restaurants.slice(0, 4), [restaurants]);

  const runAiSearch = async () => {
    if (query.trim().length < 2) {
      toast("Tell Mealora what you are craving", { description: "Try: something spicy for a date night, or a healthy lunch." });
      return;
    }
    setAiOpen(true);
    await aiSuggest.mutateAsync({ query: query.trim() }).catch(() => undefined);
  };

  const setDeliveryLocation = () => {
    const value = window.prompt("Where should we deliver?", location);
    if (value?.trim()) { setLocation(value.trim()); toast.success(`Exploring ${value.trim()}`); }
  };

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.item.id === item.id);
      return existing ? current.map((entry) => entry.item.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { item, quantity: 1 }];
    });
    toast.success(`${item.name} added to your bag`);
  };

  const checkout = async () => {
    if (!isAuthenticated) { startLogin(); return; }
    if (!cart.length) { toast("Your bag is empty", { description: "Choose a dish from a restaurant first." }); return; }
    const restaurantId = menuRestaurant?.id ?? cart[0].item.restaurantId;
    try {
      const result = await createOrder.mutateAsync({ restaurantId, deliveryAddress: location, items: cart.map((entry) => ({ menuItemId: entry.item.id, quantity: entry.quantity })) });
      setCart([]);
      toast.success(`Order ${result.orderNumber} created`, { description: "Checkout is ready for your payment gateway keys." });
    } catch (error) {
      toast.error("We could not create that order", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const saveRestaurant = async (restaurant: Restaurant) => {
    if (!isAuthenticated) { startLogin(); return; }
    await toggleFavorite.mutateAsync({ restaurantId: restaurant.id }).then((result) => toast.success(result.saved ? `${restaurant.name} saved` : `${restaurant.name} removed from saved places`)).catch(() => toast.error("Could not update saved places"));
  };

    return <div className="market-app">
    <div className="market-topline"><span><span className="live-dot" />MEALORA UGANDA</span><span className="topline-copy">One app. Every craving. Local food, real people, real delivery.</span><button onClick={() => document.getElementById("cities")?.scrollIntoView({ behavior: "smooth" })}>Explore Uganda <ArrowRight size={13} /></button></div>
    <header className="market-header"><button className="market-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="brand-orbit"><Globe2 size={17} /></span><span>MEALORA<small>FOODS</small></span></button><nav className="market-nav"><button onClick={() => document.getElementById("cities")?.scrollIntoView({ behavior: "smooth" })}>Discover</button><button onClick={() => document.getElementById("tracking")?.scrollIntoView({ behavior: "smooth" })}>Track an order</button><a href="/partners">For partners</a></nav><div className="market-actions"><button className="delivery-location" onClick={setDeliveryLocation}><MapPin size={14} />{location}<ChevronDown size={13} /></button>{isAuthenticated ? <button className="profile-chip" onClick={() => setProfileOpen(!profileOpen)}><span>{user?.name?.slice(0, 1).toUpperCase() ?? "M"}</span>{user?.name?.split(" ")[0] ?? "Profile"}</button> : <button className="login-button" onClick={() => startLogin()}>Log in</button>}<button className="bag-button" onClick={() => setProfileOpen(!profileOpen)}><ShoppingBag size={17} /><b>{cartCount}</b></button><button className="mobile-menu" onClick={() => toast("Use the links above", { description: "The full navigation is available on wider screens." })}><Menu size={20} /></button></div></header>
    {profileOpen && <div className="profile-popover"><div className="profile-popover-head"><div className="profile-avatar">{user?.name?.slice(0, 1).toUpperCase() ?? "M"}</div><div><strong>{user?.name ?? "Your Mealora account"}</strong><small>{user?.email ?? "Sign in to unlock orders and saved places"}</small></div></div><a href="/profile">Open profile & order history <ArrowRight size={14} /></a><button onClick={() => setProfileOpen(false)}>Close</button></div>}

    <main>
      <section className="market-hero"><div className="hero-shade" /><div className="container market-hero-content"><span className="hero-kicker"><span />UGANDA, DELIVERED</span><h1>Find your<br /><em>next favourite.</em></h1><p>Discover food, groceries and everyday joys from local makers across Uganda.</p><div className="ai-search"><Sparkles size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void runAiSearch(); }} placeholder="Ask for anything — try ‘a spicy dinner for two’" /><button onClick={() => void runAiSearch()}>{aiSuggest.isPending ? <span className="spinner" /> : <ArrowRight size={18} />}</button></div>{aiOpen && aiSuggest.data && <div className="ai-results"><div className="ai-results-title"><Sparkles size={14} />Mealora concierge <button onClick={() => setAiOpen(false)}><X size={14} /></button></div><p>{aiSuggest.data.explanation}</p><div className="ai-pills">{aiSuggest.data.meals.map((meal: string) => <button key={meal} onClick={() => { setQuery(meal); setAiOpen(false); }}>{meal}</button>)}</div><div className="ai-cuisine-line">Try cuisines: {aiSuggest.data.cuisines.join(" · ")}</div></div>}<div className="hero-trust"><span><Globe2 size={14} />4 Uganda cities</span><span><Zap size={14} />15 min delivery</span><span><Star size={14} fill="currentColor" />4.9 average experience</span></div></div><div className="hero-side"><span>LIVE / 01</span><strong>Meals around Uganda</strong><small>Curated in Uganda.<br />Delivered with care.</small><button onClick={() => toast("Meet the Mealora network", { description: "A Ugandan marketplace powered by local makers and boda couriers." })}><PlayIcon /></button></div></section>
      <div className="world-ticker"><div><span>DELIVERING DELICIOUSNESS</span><i>✦</i><span>FROM KAMPALA TO MBARARA</span><i>✦</i><span>GOOD FOOD, WHEREVER YOU ARE</span><i>✦</i><span>DELIVERING DELICIOUSNESS</span><i>✦</i></div></div>

      <section className="market-section" id="cities"><div className="container"><div className="section-header"><div><span className="section-kicker">CURATED AROUND YOU</span><h2>Explore Uganda<br /><em>through its food.</em></h2></div><div className="city-select"><MapPin size={15} /><select value={city} onChange={(event) => setCity(event.target.value)}><option value="">All live cities</option>{cities.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}, {entry.country}</option>)}</select><ChevronDown size={14} /></div></div><div className="city-rail">{cities.slice(0, 4).map((entry, index) => <button className={city === entry.slug ? "city-tab active" : "city-tab"} key={entry.slug} onClick={() => setCity(entry.slug)}><span>0{index + 1}</span><strong>{entry.name}</strong><small>{entry.country}</small></button>)}</div><div className="restaurant-grid">{shownRestaurants.map((restaurant) => <article className="restaurant-card" key={restaurant.id}><div className="restaurant-image"><img src={restaurant.imageUrl} alt={restaurant.name} /><span className="open-pill"><span />{restaurant.isOpen ? "Open now" : "Closed"}</span><button className="save-button" onClick={() => void saveRestaurant(restaurant)}><Heart size={17} /></button></div><div className="restaurant-info"><div><span className="restaurant-cuisine">{restaurant.cuisine}</span><h3>{restaurant.name}</h3><p>{restaurant.description}</p></div><div className="restaurant-rating"><Star size={13} fill="currentColor" />{restaurant.rating.toFixed(1)}</div></div><div className="restaurant-meta"><span><Bike size={13} />{restaurant.deliveryMinutes} min</span><span>{restaurant.priceBand} · {restaurant.reviewCount} reviews</span><button onClick={() => setMenuRestaurant(restaurant)}>View menu <ArrowRight size={14} /></button></div></article>)}</div></div></section>

      <section className="tracking-section" id="tracking"><div className="container tracking-layout"><div className="tracking-copy"><span className="section-kicker coral">UGANDA DELIVERY NETWORK</span><h2>Good things<br /><em>are on the way.</em></h2><p>Track your order from kitchen to doorstep with real-time status updates, courier movement and a clear arrival window.</p><div className="tracking-status"><span className="status-pulse"><span /></span><div><strong>{trackingStatus?.label ?? "Your next order will appear here"}</strong><small>{trackingStatus?.detail ?? "Sign in and place an order to unlock live tracking."}</small></div><b>{trackingStatus ? `${trackingStatus.etaMinutes} min` : "—"}</b></div><div className="tracking-steps"><span className={trackingPulse >= 0 ? "done" : ""}><Check size={12} />Placed</span><span className={trackingPulse >= 1 ? "done" : ""}><Check size={12} />Preparing</span><span className={trackingPulse >= 2 ? "done" : ""}><Bike size={12} />On the way</span><span><PackageCheck size={12} />At your door</span></div></div><div className="map-panel"><MapView initialCenter={{ lat: 0.3266, lng: 32.5825 }} initialZoom={13} className="mealora-map" /><div className="map-overlay"><span className="map-live"><span className="live-dot" />LIVE</span><strong>{trackingStatus?.courierName ?? "Moses"} is moving toward you</strong><small>Updated just now · {trackingStatus?.etaMinutes ?? 18} min away</small></div><div className="map-route route-a" /><div className="map-route route-b" /><div className="courier-marker"><Bike size={16} /></div></div></div></section>

      <section className="how-section"><div className="container how-grid"><div><span className="section-kicker">THE MEALORA WAY</span><h2>A marketplace<br />with a <em>local point of view.</em></h2><p>Real Ugandan restaurants. Real boda couriers. Real-time updates. Designed to make every local order feel easy.</p><a className="dark-link" href="/partners">Join the network <ArrowRight size={15} /></a></div><div className="how-cards"><div><span>01</span><Globe2 size={22} /><h3>Know every neighbourhood</h3><p>Local partners and city guides, not generic listings.</p></div><div><span>02</span><Sparkles size={22} /><h3>Search like a human</h3><p>Tell our concierge what you are in the mood for.</p></div><div><span>03</span><Bike size={22} /><h3>See every mile</h3><p>Clear updates from accepted order to front door.</p></div></div></div></section>

      <section className="partners-cta"><div className="container partners-layout"><div><span className="section-kicker">FOR MAKERS & MOVERS</span><h2>Your place<br />in <em>Uganda.</em></h2><p>Restaurants, boda couriers and businesses get the tools to grow with Uganda's favourite local marketplace.</p><a href="/partners" className="coral-button">Open partner hub <ArrowRight size={16} /></a></div><div className="partner-orbit"><div className="orbit-line one" /><div className="orbit-line two" /><div className="orbit-center"><Globe2 size={45} /><span>GOOD<br />TRAVELS</span></div><span className="orbit-tag tag-one">LOCAL</span><span className="orbit-tag tag-two">CURIOUS</span><span className="orbit-tag tag-three">CONNECTED</span></div></div></section>
    </main>

    {menuRestaurant && <div className="modal-backdrop" onClick={() => setMenuRestaurant(null)}><section className="menu-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setMenuRestaurant(null)}><X size={17} /></button><div className="menu-modal-head"><img src={menuRestaurant.imageUrl} alt={menuRestaurant.name} /><div><span>{menuRestaurant.cuisine}</span><h2>{menuRestaurant.name}</h2><p>{menuRestaurant.description}</p></div></div><div className="menu-list">{menu.length ? menu.map((item) => <div className="menu-item" key={item.id}><img src={item.imageUrl} alt={item.name} /><div><strong>{item.name}</strong><p>{item.description}</p><span>{formatMoney(item.priceCents, item.currency)}</span></div><button onClick={() => addToCart(item)}><Plus size={15} /></button></div>) : <div className="menu-loading">Loading the live menu…</div>}</div><div className="menu-modal-foot"><span>{cartCount} items · {formatMoney(cartTotal)}</span><button onClick={() => void checkout()}>{createOrder.isPending ? "Creating order…" : "Checkout"}<ArrowRight size={15} /></button></div></section></div>}

    <footer className="market-footer"><div className="container footer-main"><div><button className="market-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="brand-orbit"><Globe2 size={17} /></span><span>MEALORA<small>FOODS</small></span></button><p>Uganda's local food<br />marketplace.</p></div><div><b>Explore</b><a href="#cities">Cities & cuisines</a><a href="#tracking">Track an order</a><a href="/profile">Your profile</a></div><div><b>Partner</b><a href="/partners">Restaurant partners</a><a href="/partners">Delivery partners</a><a href="/partners">Business solutions</a></div><div><b>System status</b><span className="status-ok"><span />All systems operational</span><small>AI search · Payments · Tracking</small></div></div><div className="container footer-bottom"><span>© 2026 MEALORA FOODS</span><span>Made for curious people, everywhere.</span><span>Privacy · Terms</span></div></footer>
  </div>;
}

function PlayIcon() { return <span className="play-icon">▶</span>; }
