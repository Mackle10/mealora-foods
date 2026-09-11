ALTER TABLE `orders` ADD `courierId` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `courierLocationUpdatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `courierSharing` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurantReviews` ADD `reply` text;--> statement-breakpoint
ALTER TABLE `restaurantReviews` ADD `repliedAt` timestamp;--> statement-breakpoint
ALTER TABLE `restaurantReviews` ADD `moderationStatus` enum('visible','hidden','pending') DEFAULT 'visible' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `ownerId` int;