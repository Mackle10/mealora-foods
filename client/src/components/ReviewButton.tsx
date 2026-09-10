import { useState } from "react";
import { Check, Star } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ReviewButton({ orderId, restaurantId }: { orderId: number; restaurantId: number }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const review = trpc.reviews.create.useMutation({ onSuccess: () => { setOpen(false); toast.success("Thanks for sharing", { description: "Your restaurant review is now live." }); }, onError: (error) => toast.error("Could not save review", { description: error.message }) });
  return <>{open ? <div className="review-inline"><div className="review-stars" aria-label="Choose a rating">{[1, 2, 3, 4, 5].map((value) => <button key={value} aria-label={`${value} stars`} className={value <= rating ? "selected" : ""} onClick={() => setRating(value)}><Star size={18} fill="currentColor" /></button>)}</div><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="How was the food and delivery?" maxLength={500} /><div className="review-actions"><button onClick={() => setOpen(false)}>Cancel</button><button disabled={review.isPending} onClick={() => review.mutate({ orderId, restaurantId, rating, comment: comment.trim() || undefined })}><Check size={14} />{review.isPending ? "Saving…" : "Publish review"}</button></div></div> : <button className="review-button" onClick={() => setOpen(true)}><Star size={14} />Rate meal</button>}</>;
}
