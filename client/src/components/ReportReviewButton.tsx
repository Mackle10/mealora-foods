import { Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

export default function ReportReviewButton({ reviewId }: { reviewId: number }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Inappropriate or abusive content");
  const report = trpc.reviews.report.useMutation({ onSuccess: () => { setOpen(false); toast.success("Report submitted", { description: "Our moderation team will review this comment." }); }, onError: (error) => toast.error("Could not submit report", { description: error.message }) });
  return <div className="report-review-wrap">{open && <div className="report-review-popover"><strong>Report this review</strong><select value={reason} onChange={(event) => setReason(event.target.value)}><option>Inappropriate or abusive content</option><option>Spam or promotion</option><option>Hate speech or harassment</option><option>False or misleading content</option></select><div><button onClick={() => setOpen(false)}>Cancel</button><button disabled={report.isPending} onClick={() => report.mutate({ reviewId, reason })}>{report.isPending ? "Sending…" : "Send report"}</button></div></div>}<button className="report-review-button" aria-label="Report review" onClick={() => { if (!isAuthenticated) { startLogin(); return; } setOpen((value) => !value); }}><Flag size={13} />Report</button></div>;
}
