export function isVerifiedRestaurantOwner(role: string, ownerVerified: number) {
  return (role === "restaurant_owner" || role === "admin") && ownerVerified === 1;
}

export function canReportReview(reporterId: number, reviewAuthorId: number) {
  return reporterId > 0 && reviewAuthorId > 0 && reporterId !== reviewAuthorId;
}
