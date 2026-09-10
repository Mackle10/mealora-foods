import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ReorderButton({ orderId }: { orderId: number }) {
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const draft = trpc.orders.reorderDraft.useQuery({ orderId }, { enabled: open });
  const utils = trpc.useUtils();
  const reorder = trpc.orders.reorder.useMutation({ onSuccess: async (result) => { await utils.orders.list.invalidate(); setOpen(false); toast.success("Reorder placed", { description: `${result.orderNumber} is back in motion.` }); }, onError: (error) => toast.error("Could not reorder", { description: error.message }) });

  useEffect(() => {
    if (draft.data) {
      setQuantities(Object.fromEntries(draft.data.items.map((item) => [item.menuItemId, item.quantity])));
      setInstructions(draft.data.specialInstructions ?? "");
    }
  }, [draft.data]);

  const setQuantity = (menuItemId: number, quantity: number) => setQuantities((current) => ({ ...current, [menuItemId]: Math.max(0, Math.min(20, quantity)) }));
  const submit = () => {
    const items = Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([menuItemId, quantity]) => ({ menuItemId: Number(menuItemId), quantity }));
    if (!items.length) { toast("Keep at least one meal", { description: "Set a quantity before placing the reorder." }); return; }
    reorder.mutate({ orderId, specialInstructions: instructions.trim() || undefined, items });
  };

  return <><button className="reorder-button" onClick={() => setOpen(true)}><RotateCcw size={14} />Reorder</button>{open && <div className="modal-backdrop" onClick={() => setOpen(false)}><section className="reorder-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close reorder editor" onClick={() => setOpen(false)}><X size={17} /></button><span className="dashboard-kicker">REORDER REVIEW</span><h2>Make it yours again.</h2><p>Adjust portions or leave a note for the kitchen before placing this reorder.</p>{draft.isLoading ? <div className="loading-line"><span /><span /><span /></div> : <><div className="reorder-items">{draft.data?.items.map((item) => <div className="reorder-item" key={item.menuItemId}><div><strong>{item.itemName}</strong><small>UGX {item.unitPriceCents.toLocaleString()} each</small></div><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(item.menuItemId, (quantities[item.menuItemId] ?? 0) - 1)}><Minus size={13} /></button><b>{quantities[item.menuItemId] ?? 0}</b><button aria-label="Increase quantity" onClick={() => setQuantity(item.menuItemId, (quantities[item.menuItemId] ?? 0) + 1)}><Plus size={13} /></button></div></div>)}</div><label className="reorder-instructions">Special instructions<textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="E.g. less spicy, call at the gate…" maxLength={500} /></label><button className="reorder-submit" disabled={reorder.isPending} onClick={submit}>{reorder.isPending ? "Placing reorder…" : "Place reorder · Cash on delivery"}<ArrowRight size={15} /></button></>}</section></div>}</>;
}
