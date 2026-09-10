import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ReorderButton({ orderId }: { orderId: number }) {
  const utils = trpc.useUtils();
  const reorder = trpc.orders.reorder.useMutation({ onSuccess: async (result) => { await utils.orders.list.invalidate(); toast.success("Reorder created", { description: `${result.orderNumber} is back in motion.` }); }, onError: (error) => toast.error("Could not reorder", { description: error.message }) });
  return <button className="reorder-button" disabled={reorder.isPending} onClick={() => reorder.mutate({ orderId })}><RotateCcw size={14} />{reorder.isPending ? "Reordering…" : "Reorder"}</button>;
}
