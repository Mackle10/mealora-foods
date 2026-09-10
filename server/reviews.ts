export function canReviewOrder(orderStatus: string) {
  return orderStatus === "delivered";
}

export function calculateNextRatingBasis(currentBasis: number, currentCount: number, nextRating: number) {
  const nextCount = currentCount + 1;
  return { ratingBasis: Math.round((((currentBasis / 100) * currentCount) + nextRating) / nextCount * 100), reviewCount: nextCount };
}
