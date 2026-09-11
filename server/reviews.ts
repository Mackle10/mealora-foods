export function canReviewOrder(orderStatus: string) {
  return orderStatus === "delivered";
}

export function calculateNextRatingBasis(currentBasis: number, currentCount: number, nextRating: number) {
  const nextCount = currentCount + 1;
  return { ratingBasis: Math.round((((currentBasis / 100) * currentCount) + nextRating) / nextCount * 100), reviewCount: nextCount };
}

export function isPublicReviewStatus(status: string) {
  return status === "visible";
}

export function isValidCourierPoint(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
