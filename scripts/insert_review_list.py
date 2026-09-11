from pathlib import Path
p=Path('/home/ubuntu/mealora-foods/client/src/pages/Home.tsx')
s=p.read_text()
needle='<div className="checkout-payment">'
insert='<div className="menu-reviews"><div className="menu-reviews-head"><span>RECENT REVIEWS</span><small>{reviewsQuery.data?.length ?? 0} visible</small></div>{reviewsQuery.data?.length ? reviewsQuery.data.slice(0, 4).map((review) => <article className="menu-review" key={review.id}><div><strong>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong><p>{review.comment || "Customer left a rating without a comment."}</p>{review.reply && <small>Restaurant reply: {review.reply}</small>}</div><ReportReviewButton reviewId={review.id} /></article>) : <p className="menu-reviews-empty">No reviews yet. Be the first to share your experience after delivery.</p>}</div><div className="checkout-payment">'
if needle not in s: raise SystemExit("target not found")
p.write_text(s.replace(needle, insert, 1))
