import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bike,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  MapPin,
  Menu,
  PackageCheck,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";

const storage = "/manus-storage/";

const categories = [
  { label: "Restaurants", icon: Utensils, count: "1,240 places" },
  { label: "Groceries", icon: ShoppingBag, count: "340 stores" },
  { label: "Bakery & coffee", icon: Sparkles, count: "180 favourites" },
  { label: "Pharmacy", icon: PackageCheck, count: "Fast essentials" },
];

const places = [
  {
    name: "Kora Kitchen",
    tag: "West African · Comfort food",
    time: "20–30 min",
    price: "$$",
    rating: "4.8",
    image: `${storage}mealora-dish_8a7e9543.jpg`,
    color: "#f5dec8",
  },
  {
    name: "The Green Table",
    tag: "Seasonal · Plant-forward",
    time: "25–35 min",
    price: "$$$",
    rating: "4.9",
    image: `${storage}mealora-market_ea07f1eb.jpg`,
    color: "#d9e3c8",
  },
  {
    name: "Moyo Bakery",
    tag: "Pastries · Coffee · Brunch",
    time: "15–25 min",
    price: "$",
    rating: "4.7",
    image: `${storage}mealora-hero_9bb0f524.jpg`,
    color: "#f4d487",
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Home() {
  const [location, setLocation] = useState("Accra, Ghana");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);

  const filteredPlaces = useMemo(() => {
    if (!search.trim()) return showAll ? [...places, ...places] : places;
    return places.filter((place) =>
      `${place.name} ${place.tag}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, showAll]);

  const handleOrder = () => {
    toast.success("Nice choice — your order basket is ready.", {
      description: "Pick a place below to get started.",
    });
    scrollToId("discover");
  };

  const handleLocation = () => {
    const next = window.prompt("Where should we deliver?", location);
    if (next?.trim()) {
      setLocation(next.trim());
      toast.success(`Delivering to ${next.trim()}`);
    }
  };

  const handleAdd = (name: string) => {
    toast.success(`${name} added to your basket`, {
      description: "You can review your order anytime from the basket icon.",
    });
  };

  return (
    <div className="mealora-page">
      <div className="announcement">
        <div className="announcement-inner">
          <span className="announcement-dot" />
          <span>Fresh flavours, delivered with care.</span>
          <button onClick={() => scrollToId("about")} className="announcement-link">
            Why Mealora <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <header className="site-header">
        <div className="container nav-wrap">
          <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Mealora Foods home">
            <span className="brand-mark"><span /></span>
            <span className="brand-name">MEALORA <em>FOODS</em></span>
          </button>
          <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
            <button onClick={() => { scrollToId("discover"); setMenuOpen(false); }}>Discover</button>
            <button onClick={() => { scrollToId("how-it-works"); setMenuOpen(false); }}>How it works</button>
            <button onClick={() => { scrollToId("partner"); setMenuOpen(false); }}>Partner with us</button>
          </nav>
          <div className="nav-actions">
            <button className="location-btn" onClick={handleLocation}><MapPin size={15} /><span>{location}</span><ChevronDown size={14} /></button>
            <button className="sign-in" onClick={() => toast("Sign in is coming soon", { description: "For now, explore your neighbourhood favourites." })}>Sign in</button>
            <button className="basket-btn" onClick={() => toast("Your basket is empty", { description: "Add something delicious to get started." })} aria-label="Open basket"><ShoppingBag size={18} /><span>0</span></button>
            <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> Your neighbourhood, on the menu</div>
              <h1>Good food<br /><span>finds you.</span></h1>
              <p className="hero-lede">From your favourite local spot to the ingredients for tonight's dinner — discover more of what makes your city delicious.</p>
              <div className="hero-ctas">
                <button className="primary-btn" onClick={handleOrder}>Start an order <ArrowRight size={17} /></button>
                <button className="text-btn" onClick={() => scrollToId("discover")}>Browse nearby <span>↘</span></button>
              </div>
              <div className="hero-proof"><div className="proof-avatars"><span className="avatar a1">A</span><span className="avatar a2">K</span><span className="avatar a3">M</span><span className="avatar a4">+</span></div><p><strong>Loved by 12,000+</strong><br />hungry neighbours</p></div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrap"><img src={`${storage}mealora-hero_9bb0f524.jpg`} alt="Jollof rice with grilled chicken, plantain and herbs" /></div>
              <div className="hero-note note-top"><span className="note-icon"><Clock3 size={16} /></span><span><strong>On its way</strong><br /><small>Arriving in 24 min</small></span></div>
              <div className="hero-note note-bottom"><span className="note-star">✦</span><span><strong>Made local</strong><br /><small>100% neighbourhood picks</small></span></div>
              <span className="doodle doodle-one">✳</span><span className="doodle doodle-two">∿</span>
            </div>
          </div>
        </section>

        <section className="quick-order" aria-label="Quick order">
          <div className="container quick-order-inner">
            <div className="quick-label"><span className="pin-pulse"><MapPin size={16} /></span><span><small>Delivering to</small><strong>{location}</strong></span></div>
            <div className="search-box"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for restaurants, groceries, or a craving" aria-label="Search marketplace" /><kbd>⌘ K</kbd></div>
            <button className="search-submit" onClick={() => scrollToId("discover")} aria-label="Search"><ArrowRight size={19} /></button>
          </div>
        </section>

        <section className="category-section" id="discover">
          <div className="container">
            <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> What's on your mind?</div><h2>Pick a little<br /><i>something.</i></h2></div><button className="round-arrow" onClick={() => setShowAll(!showAll)} aria-label="Show more categories"><ArrowRight size={21} /></button></div>
            <div className="category-grid">{categories.map(({ label, icon: Icon, count }, index) => <button key={label} className={`category-card category-${index + 1}`} onClick={() => { setSearch(label.split(" ")[0]); toast(`${label} selected`, { description: count }); }}><span className="category-icon"><Icon size={24} strokeWidth={1.7} /></span><span className="category-text"><strong>{label}</strong><small>{count}</small></span><ArrowRight size={18} className="category-arrow" /></button>)}</div>
          </div>
        </section>

        <section className="places-section">
          <div className="container">
            <div className="section-heading places-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> Top picks around you</div><h2>Worth leaving<br /><i>the house for.</i></h2></div><button className="outline-btn" onClick={() => { setShowAll(!showAll); toast(showAll ? "Showing the essentials" : "Showing all nearby picks"); }}>{showAll ? "Show less" : "See all places"} <ArrowRight size={16} /></button></div>
            <div className="place-grid">{filteredPlaces.length ? filteredPlaces.map((place, index) => <article className="place-card" key={`${place.name}-${index}`}><div className="place-image" style={{ backgroundColor: place.color }}><img src={place.image} alt={place.name} /><button className={`heart-btn ${liked.includes(place.name) ? "liked" : ""}`} onClick={() => { setLiked((current) => current.includes(place.name) ? current.filter((item) => item !== place.name) : [...current, place.name]); }} aria-label={`Favourite ${place.name}`}><Heart size={18} fill={liked.includes(place.name) ? "currentColor" : "none"} /></button><span className="delivery-pill"><Clock3 size={13} /> {place.time}</span></div><div className="place-meta"><div><h3>{place.name}</h3><p>{place.tag}</p></div><div className="place-rating"><Star size={14} fill="currentColor" /> {place.rating}</div></div><div className="place-footer"><span>{place.price} · Free delivery over $25</span><button onClick={() => handleAdd(place.name)}>Add <span>+</span></button></div></article>) : <div className="empty-state"><Search size={22} /><strong>No nearby matches yet.</strong><span>Try “coffee”, “rice”, or clear your search.</span><button onClick={() => setSearch("")}>Clear search</button></div>}</div>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="container how-grid"><div className="how-intro"><div className="eyebrow light"><span className="eyebrow-line" /> The Mealora way</div><h2>More than<br /><i>a delivery.</i></h2><p>We connect you to the people, places and flavours that make your neighbourhood feel like home.</p><button className="cream-btn" onClick={() => toast("That is the Mealora way", { description: "Local food, thoughtful delivery, happier neighbourhoods." })}>Our story <ArrowRight size={16} /></button></div><div className="steps-wrap"><div className="step"><span className="step-number">01</span><div className="step-icon"><MapPin size={22} /></div><div><h3>Tell us where</h3><p>We’ll find the good stuff around your doorstep.</p></div></div><div className="step"><span className="step-number">02</span><div className="step-icon"><Sparkles size={22} /></div><div><h3>Choose your craving</h3><p>Discover local favourites and hidden gems.</p></div></div><div className="step"><span className="step-number">03</span><div className="step-icon"><Bike size={22} /></div><div><h3>We’ll bring it warm</h3><p>Tracked, thoughtful delivery — from their kitchen to yours.</p></div></div></div></div>
        </section>

        <section className="partner-section" id="partner"><div className="container partner-grid"><div className="partner-image"><img src={`${storage}mealora-market_ea07f1eb.jpg`} alt="Local market with fresh produce and neighbours" /><span className="partner-stamp">good<br />travels<br /><b>✦</b></span></div><div className="partner-copy"><div className="eyebrow"><span className="eyebrow-line" /> For the makers</div><h2>Your food has<br /><i>somewhere to go.</i></h2><p>Join a marketplace built around good food, fair partnerships and the people who make every bite worth talking about.</p><div className="partner-links"><button onClick={() => toast("Restaurant partner form coming soon", { description: "We’ll help you bring your menu to more hungry neighbours." })}><span><Store size={20} />Restaurant partners</span><ArrowRight size={18} /></button><button onClick={() => toast("Courier sign-up coming soon", { description: "Make your own hours and move good things around town." })}><span><Bike size={20} />Delivery partners</span><ArrowRight size={18} /></button></div></div></div></section>

        <section className="newsletter-section" id="about"><div className="container newsletter-inner"><div><div className="eyebrow"><span className="eyebrow-line" /> A little note from us</div><h2>Good things are<br /><i>worth sharing.</i></h2></div><div className="newsletter-form"><p>Get occasional cravings, neighbourhood finds and the first taste of what’s new.</p><form onSubmit={(e) => { e.preventDefault(); toast.success("You’re on the list", { description: "We’ll keep it delicious and never too noisy." }); }}><input type="email" required placeholder="Your email address" aria-label="Email address" /><button type="submit"><ArrowRight size={19} /></button></form><small>By subscribing, you agree to hear from Mealora. Unsubscribe anytime.</small></div></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-top"><button className="brand footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="brand-mark"><span /></span><span className="brand-name">MEALORA <em>FOODS</em></span></button><p>Made for the way<br />your city eats.</p><div className="footer-nav"><a href="#discover">Discover</a><a href="#how-it-works">Our way</a><a href="#partner">Partner</a><a href="#about">Contact</a></div><button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top <ArrowRight size={15} /></button></div><div className="container footer-bottom"><span>© 2026 Mealora Foods</span><span>Made with care, wherever you are.</span><span>Instagram &nbsp; · &nbsp; TikTok</span></div></footer>
    </div>
  );
}
