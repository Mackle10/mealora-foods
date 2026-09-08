import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bike,
  ChevronDown,
  ChevronRight,
  Globe2,
  Heart,
  MapPin,
  Menu,
  PackageCheck,
  Play,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const img = "/manus-storage/";
const cities = [
  { name: "Lagos", country: "Nigeria", dish: "Jollof, suya & more", image: `${img}mealora-dish_8a7e9543.jpg`, accent: "#f36b35" },
  { name: "Tokyo", country: "Japan", dish: "Ramen, sushi & izakaya", image: `${img}mealora-global-hero_3f739ae9.jpg`, accent: "#6885ff" },
  { name: "Lisbon", country: "Portugal", dish: "Pastéis & coastal plates", image: `${img}mealora-market_ea07f1eb.jpg`, accent: "#edc35d" },
];
const categories = ["All cuisines", "African", "Asian", "European", "Latin American", "Wellness"];

export default function Home() {
  const [location, setLocation] = useState("Accra, Ghana");
  const [activeCategory, setActiveCategory] = useState("All cuisines");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);
  const filteredCities = useMemo(() => query ? cities.filter((city) => `${city.name} ${city.country} ${city.dish}`.toLowerCase().includes(query.toLowerCase())) : cities, [query]);
  const locate = () => { const value = window.prompt("Where should we deliver?", location); if (value?.trim()) { setLocation(value.trim()); toast.success(`Now exploring ${value.trim()}`); } };
  const notice = (title: string, description: string) => toast(title, { description });
  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return <div className="global-site">
    <div className="topline"><span><span className="live-dot" />MEALORA WORLDWIDE</span><span className="topline-center">One app. Every craving. 40+ cities and counting.</span><button onClick={() => scroll("cities")}>Explore the world <ArrowRight size={13} /></button></div>
    <header className="global-header"><button className="global-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="brand-symbol"><Globe2 size={18} /></span><span>MEALORA<small>FOODS</small></span></button><nav className={menu ? "global-nav open" : "global-nav"}><button onClick={() => scroll("cities")}>Discover</button><button onClick={() => scroll("how")}>How it works</button><button onClick={() => scroll("partners")}>For business</button><button onClick={() => notice("The Mealora journal is coming soon", "Stories, recipes and people from around the table.")}>Journal</button></nav><div className="header-actions"><button className="location-dark" onClick={locate}><MapPin size={15} />{location}<ChevronDown size={14} /></button><button className="header-login" onClick={() => notice("Welcome back", "Sign in and your saved places will appear here.")}>Log in</button><button className="header-signup" onClick={() => notice("Early access is open", "We will let you know when Mealora launches in your city.")}>Get started</button><button className="header-cart" onClick={() => notice("Your bag is waiting", "Add a favourite dish to get started.")}><ShoppingBag size={17} /><b>0</b></button><button className="mobile-menu" onClick={() => setMenu(!menu)}>{menu ? <X size={20} /> : <Menu size={20} />}</button></div></header>

    <main>
      <section className="global-hero"><div className="hero-overlay" /><div className="container global-hero-inner"><div className="hero-tag"><span className="hero-tag-dot" />THE WORLD, DELIVERED</div><h1>Find your<br /><em>next favourite.</em></h1><p>One beautiful place for the food, groceries and little everyday joys that make every city worth tasting.</p><div className="hero-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a dish, place or city" /><button onClick={() => scroll("cities")}><ArrowRight size={18} /></button></div><div className="hero-meta"><span><Globe2 size={14} />Live in 40+ cities</span><span><Zap size={14} />Delivery from 15 min</span><span><Star size={14} fill="currentColor" />4.9 average experience</span></div></div><div className="hero-side-note"><span>01 / 03</span><b>Meals without borders</b><small>Curated locally.<br />Delivered globally.</small><button onClick={() => notice("Watch the Mealora story", "A world of food, one thoughtful delivery at a time.")}><Play size={13} fill="currentColor" /></button></div></section>

      <div className="world-strip"><div className="world-strip-track"><span>DELIVERING DELICIOUSNESS</span><i>✦</i><span>FROM LOCAL TO GLOBAL</span><i>✦</i><span>GOOD FOOD HAS NO BORDERS</span><i>✦</i><span>DELIVERING DELICIOUSNESS</span><i>✦</i><span>FROM LOCAL TO GLOBAL</span></div></div>

      <section className="intro-section"><div className="container intro-grid"><div><span className="eyebrow-blue">THE MEALORA DIFFERENCE</span><h2>The shortcut<br />to <em>somewhere else.</em></h2></div><div className="intro-copy"><p>Great food is a passport. Mealora makes it easier to discover the dishes, people and places that turn a meal into a memory — right where you are.</p><button className="line-button" onClick={() => scroll("how")}>See how we do it <ArrowRight size={16} /></button></div></div></section>

      <section className="cities-section" id="cities"><div className="container"><div className="section-top"><div><span className="eyebrow-blue">CURATED AROUND THE WORLD</span><h2>Start with a<br /><em>city you love.</em></h2></div><button className="view-all" onClick={() => notice("40+ cities, one Mealora", "Global discovery is rolling out city by city.")}>View all cities <ArrowRight size={16} /></button></div><div className="category-tabs">{categories.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => { setActiveCategory(category); notice(category, "Curated picks will update as more Mealora cities come online."); }}>{category}</button>)}</div><div className="city-grid">{filteredCities.map((city, index) => <article className={`city-card card-${index + 1}`} key={city.name}><img src={city.image} alt={`${city.name} food`} /><div className="city-gradient" /><div className="city-top"><span>MEALORA CITY GUIDE</span><button onClick={() => setLiked((current) => current.includes(city.name) ? current.filter((item) => item !== city.name) : [...current, city.name])} className={liked.includes(city.name) ? "liked" : ""}><Heart size={17} fill={liked.includes(city.name) ? "currentColor" : "none"} /></button></div><div className="city-content"><span className="city-country">{city.country}</span><h3>{city.name}</h3><p>{city.dish}</p><button onClick={() => notice(`Exploring ${city.name}`, "Showing the flavours that define this city.")}>Explore city <ArrowRight size={15} /></button></div></article>)}{!filteredCities.length && <div className="no-results">No city found yet. Try Lagos, Tokyo or Lisbon.</div>}</div></div></section>

      <section className="how-global" id="how"><div className="container how-global-inner"><div className="how-copy"><span className="eyebrow-coral">FROM DOORSTEP TO DESTINATION</span><h2>We bring the<br /><em>whole world</em><br />closer.</h2><p>Behind every order is a living network of local makers, thoughtful couriers and curious people. That is the Mealora way.</p><button className="coral-button" onClick={() => notice("The Mealora way", "Local knowledge, global standards, human delivery.")}>Our approach <ArrowRight size={16} /></button></div><div className="how-steps"><div className="how-step"><span>01</span><div className="how-step-icon"><MapPin size={21} /></div><div><h3>Set your coordinates</h3><p>Tell us where you are and we will map the good stuff around you.</p></div></div><div className="how-step"><span>02</span><div className="how-step-icon"><Sparkles size={21} /></div><div><h3>Follow your curiosity</h3><p>Browse local legends, new openings and flavours from further afield.</p></div></div><div className="how-step"><span>03</span><div className="how-step-icon"><Bike size={21} /></div><div><h3>We move it with care</h3><p>Real-time tracking, fair delivery and a little more joy at the door.</p></div></div></div></div></section>

      <section className="live-section"><div className="container live-grid"><div className="live-board"><div className="live-board-header"><span><span className="live-dot coral" />LIVE DELIVERY</span><span>MEALORA / 09:42</span></div><div className="route-line"><div className="route-point start"><span>01</span></div><div className="route-path"><i /><i /><i /><i /><i /></div><div className="route-point end"><span>02</span></div></div><div className="route-labels"><div><small>FROM</small><strong>Kora Kitchen</strong><span>Smoky jollof · Lagos</span></div><div><small>TO</small><strong>Your table</strong><span>Arriving in 18 min</span></div></div><div className="live-card-footer"><span><Bike size={16} /> Kofi is on the way</span><button onClick={() => notice("Live tracking", "Your rider is on the final stretch.")}>Track order <ArrowRight size={14} /></button></div></div><div className="live-copy"><span className="eyebrow-blue">A LITTLE MORE CERTAINTY</span><h2>Good things<br /><em>are on the way.</em></h2><p>From the first tap to the last mile, we keep the experience clear, considered and distinctly human.</p><div className="stat-row"><div><strong>15<span>min</span></strong><small>fastest delivery</small></div><div><strong>40<span>+</span></strong><small>cities to explore</small></div><div><strong>4.9<span>★</span></strong><small>average rating</small></div></div></div></div></section>

      <section className="partners-global" id="partners"><div className="container partner-global-grid"><div className="partner-global-copy"><span className="eyebrow-coral">FOR MAKERS & MOVERS</span><h2>Your place<br />in the <em>world.</em></h2><p>Bring your menu, store or route to a platform designed for the next generation of global commerce.</p><div className="partner-global-links"><button onClick={() => notice("Restaurant partnerships", "Bring your menu to new tables around the world.")}><span><Utensils size={19} />List your restaurant</span><ChevronRight size={18} /></button><button onClick={() => notice("Delivery partnerships", "Make your city move with Mealora.")}><span><Bike size={19} />Become a courier</span><ChevronRight size={18} /></button><button onClick={() => notice("Business solutions", "A smarter way to deliver more than food.")}><span><Store size={19} />Work with Mealora</span><ChevronRight size={18} /></button></div></div><div className="partner-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><Globe2 size={54} strokeWidth={1} /><span>GOOD<br />TRAVELS</span></div><span className="orbit-label l1">LOCAL</span><span className="orbit-label l2">CURIOUS</span><span className="orbit-label l3">CONNECTED</span></div></div></section>

      <section className="app-section"><div className="container app-grid"><div><span className="eyebrow-blue">THE APP FOR EVERYWHERE</span><h2>Carry the<br /><em>world with you.</em></h2><p>Save your favourite places, follow every delivery and keep a little piece of every city close.</p><div className="app-buttons"><button onClick={() => notice("App download", "iOS and Android downloads are coming soon.")}>Download the app <ArrowRight size={16} /></button><button className="store-button" onClick={() => notice("App store preview", "The Mealora app is being prepared for launch.")}><span>Available soon on</span><strong>App Store & Google Play</strong></button></div></div><div className="phone-stack"><div className="phone phone-back"><div className="phone-screen map-screen"><span className="map-grid" /><span className="map-pin p1" /><span className="map-pin p2" /><span className="map-pin p3" /></div></div><div className="phone phone-front"><div className="phone-screen order-screen"><small>ON THE WAY</small><strong>Good food<br />finds you.</strong><div className="mini-order"><img src={`${img}mealora-dish_8a7e9543.jpg`} alt="Dish" /><span>Kora Kitchen<br /><b>Arriving in 18 min</b></span></div></div></div></div></div></section>
    </main>

    <footer className="global-footer"><div className="container footer-main"><div><button className="global-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="brand-symbol"><Globe2 size={18} /></span><span>MEALORA<small>FOODS</small></span></button><p>The world's local food<br />marketplace.</p></div><div className="footer-column"><b>Explore</b><a href="#cities">Cities</a><a href="#how">How it works</a><a href="#partners">For business</a><a href="#">Journal</a></div><div className="footer-column"><b>Company</b><a href="#">About Mealora</a><a href="#">Careers</a><a href="#">Sustainability</a><a href="#">Contact</a></div><div className="footer-column"><b>Follow along</b><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">LinkedIn</a><a href="#">X / Twitter</a></div></div><div className="container footer-bottom"><span>© 2026 MEALORA FOODS</span><span>Made for curious people, everywhere.</span><span>Privacy &nbsp;·&nbsp; Terms</span></div></footer>
  </div>;
}
