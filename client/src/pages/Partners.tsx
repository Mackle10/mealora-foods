import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Bike, Building2, CheckCircle2, CircleDollarSign, Store, Utensils } from "lucide-react";
import { toast } from "sonner";

const partnerTypes = [
  { id: "restaurant" as const, label: "Restaurant", title: "Bring your menu to more tables", icon: Utensils, detail: "Reach hungry customers, manage live menus and grow your delivery channel." },
  { id: "courier" as const, label: "Courier", title: "Move good things around town", icon: Bike, detail: "Choose your hours, get clear routes and build reliable earnings." },
  { id: "business" as const, label: "Business", title: "Deliver more than food", icon: Building2, detail: "Power your customer experience with a Uganda-wide delivery network." },
];

export default function Partners() {
  const [type, setType] = useState<"restaurant" | "courier" | "business">("restaurant");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [details, setDetails] = useState("");
  const apply = trpc.partners.submitApplication.useMutation();
  const selected = partnerTypes.find((entry) => entry.id === type)!;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await apply.mutateAsync({ applicationType: type, businessName, contactEmail: email, city, details }).then(() => { setBusinessName(""); setEmail(""); setCity(""); setDetails(""); toast.success("Application received", { description: "The Mealora partnerships team will be in touch." }); }).catch((error: unknown) => toast.error("Could not submit application", { description: error instanceof Error ? error.message : "Please try again." }));
  };
  return <DashboardLayout><div className="partner-dashboard"><div className="dashboard-topbar"><div><span className="dashboard-kicker">MEALORA UGANDA PARTNER HUB</span><h1>Build the next<br /><em>great food city.</em></h1><p>One operating system for Ugandan restaurants, boda couriers and modern businesses.</p></div><div className="partner-dashboard-mark"><CircleDollarSign size={34} /><span>UGANDA<br />NETWORK</span></div></div><div className="partner-dashboard-stats"><div><strong>4</strong><span>towns activated</span></div><div><strong>Local</strong><span>makers first</span></div><div><strong>4.9</strong><span>partner experience</span></div><div><strong>24/7</strong><span>support network</span></div></div><div className="partner-content-grid"><div className="partner-type-list">{partnerTypes.map((entry) => <button className={type === entry.id ? "partner-type active" : "partner-type"} key={entry.id} onClick={() => setType(entry.id)}><span className="partner-type-icon"><entry.icon size={20} /></span><span><strong>{entry.label}</strong><small>{entry.detail}</small></span><ArrowRight size={16} /></button>)}</div><form className="partner-form" onSubmit={submit}><div className="partner-form-head"><span className="dashboard-kicker">START A CONVERSATION</span><h2>{selected.title}</h2><p>{selected.detail}</p></div><label>Business or full name<input required value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder={type === "courier" ? "Your full name" : "Your business name"} /></label><div className="form-two"><label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>City<input required value={city} onChange={(event) => setCity(event.target.value)} placeholder="Kampala, Uganda" /></label></div><label>Tell us a little more<textarea required value={details} onChange={(event) => setDetails(event.target.value)} placeholder={type === "restaurant" ? "Cuisine, number of locations, current delivery setup…" : type === "courier" ? "Vehicle type, availability and the areas you know best…" : "What would you like to deliver with Mealora?"} rows={5} /></label><button className="partner-submit" type="submit" disabled={apply.isPending}>{apply.isPending ? "Sending application…" : "Send application"} <ArrowRight size={16} /></button><small className="form-note"><CheckCircle2 size={13} />We reply within one working day.</small></form></div><div className="partner-tools"><div><Store size={18} /><strong>Partner console</strong><span>Menus, availability & payouts</span></div><div><Bike size={18} /><strong>Courier workspace</strong><span>Routes, shifts & earnings</span></div><div><Building2 size={18} /><strong>Business toolkit</strong><span>One API, every doorstep</span></div></div></div></DashboardLayout>;
}
