CREATE TABLE `restaurantReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`orderId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurantReviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `restaurantReviews_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','courier') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `orders` ADD `specialInstructions` text;