import { useState } from "react";
import { Check, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AddressBook() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Home");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Kampala");
  const [instructions, setInstructions] = useState("");
  const addresses = trpc.addresses.list.useQuery();
  const utils = trpc.useUtils();
  const save = trpc.addresses.save.useMutation({ onSuccess: async () => { await utils.addresses.list.invalidate(); setOpen(false); setRecipientName(""); setPhone(""); setAddress(""); setInstructions(""); toast.success("Delivery address saved"); } });
  const remove = trpc.addresses.remove.useMutation({ onSuccess: () => utils.addresses.list.invalidate() });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate({ label, recipientName, phone, address, city, instructions: instructions || undefined, isDefault: !addresses.data?.length });
  };

  return <div className="address-book"><div className="profile-card-head"><div><span className="dashboard-kicker">DELIVERY ADDRESSES</span><h2>Places you trust</h2></div><button className="address-add" onClick={() => setOpen(!open)}><Plus size={14} />Add place</button></div><p className="address-intro">Save home, work, or any favourite drop-off point for faster Uganda deliveries.</p>{addresses.isLoading ? <div className="loading-line" /> : addresses.data?.length ? <div className="address-list">{addresses.data.map((item) => <div className="address-row" key={item.id}><div className="address-icon"><MapPin size={16} /></div><div><strong>{item.label}{item.isDefault ? <span className="default-badge"><Check size={10} />Default</span> : null}</strong><span>{item.address}, {item.city}</span><small>{item.recipientName} · {item.phone}</small></div><button aria-label={`Remove ${item.label}`} onClick={() => remove.mutate({ addressId: item.id })}><Trash2 size={14} /></button></div>)}</div> : <div className="address-empty"><MapPin size={17} /><span>No saved addresses yet. Add one to speed up checkout.</span></div>}{open && <form className="address-form" onSubmit={submit}><div className="address-form-grid"><label>Label<input required value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Home" /></label><label>City<select value={city} onChange={(event) => setCity(event.target.value)}><option>Kampala</option><option>Entebbe</option><option>Jinja</option><option>Mbarara</option></select></label><label>Recipient name<input required value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Amina Nakato" /></label><label>Phone number<input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+256 7XX XXX XXX" /></label><label className="address-form-wide">Address / landmark<input required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Plot 12, Kira Road, near ..." /></label><label className="address-form-wide">Delivery instructions<input value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Call when you arrive" /></label></div><button className="address-save" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save address"}</button></form>}</div>;
}
